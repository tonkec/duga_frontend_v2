import { BiInfoCircle, BiSolidCamera, BiSolidFile } from 'react-icons/bi';
import AppLayout from '@app/components/AppLayout';
import Card from '@app/components/Card';
import PhotoUploader from '@app/components/PhotoUploader';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Input from '@app/components/Input';
import Select from 'react-select';
import TextArea from '@app/components/Textarea';
import { useUpdateUser } from './hooks';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import Button from '@app/components/Button';
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';
import Label from '@app/components/Label';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import { cityOptions } from '@app/consts/cityOptions';
import FieldError from '@app/components/FieldError';

const lookingForOptions = [
  { value: 'friendship', label: 'Prijateljstvo' },
  { value: 'date', label: 'Dejt' },
  { value: 'relationship', label: 'Vezu' },
  { value: 'marriage', label: 'Brak' },
  { value: 'partnership', label: 'Partnerstvo' },
  { value: 'nothing', label: 'Samo zujim' },
  { value: 'idk', label: 'Ne znam' },
];

const relationshipStatusOptions = [
  {
    value: 'single',
    label: 'Single',
  },
  { value: 'relationship', label: 'U vezi' },
  { value: 'marriage', label: 'U braku' },
  { value: 'partnership', label: 'U partnerstvu' },
  { value: 'inbetween', label: 'Nešto izmedju' },
  { value: 'divorced', label: 'Razveden/a' },
  { value: 'widowed', label: 'Udovac/udovica' },
  { value: 'separated', label: 'Razdvojen/a' },
  { value: 'open', label: 'U otvorenoj vezi' },
  { value: 'engaged', label: 'Zaručen/a' },
  { value: 'idk', label: 'Ne znam' },
];

const daysOfWeek = [
  { value: 'monday', label: 'Ponedjeljak' },
  { value: 'tuesday', label: 'Utorak' },
  { value: 'wednesday', label: 'Srijeda' },
  { value: 'thursday', label: 'Četvrtak' },
  { value: 'friday', label: 'Petak' },
  { value: 'saturday', label: 'Subota' },
  { value: 'sunday', label: 'Nedjelja' },
];

type Inputs = {
  bio: string;
  age: string;
  location: string;
  sexuality: string;
  gender: string;
  username: string;
  lookingFor: string;
  relationshipStatus: string;
  cigarettes: boolean;
  alcohol: boolean;
  sport: boolean;
  favoriteDay: string;
  spirituality: string;
  embarasement: string;
  tooOldFor: string;
  makesMyDay: string;
  favoriteSong: string;
  favoriteMovie: string;
  interests: string;
  languages: string;
  ending: string;
};

const schema = z.object({
  bio: z.string().max(100, { message: 'Polje ne smije biti dulje od 100 znakova.' }).optional(),
  location: z.string().nullable().optional(),
  sexuality: z.string().optional(),
  gender: z.string().max(100, { message: 'Polje ne smije biti dulje od 100 znakova.' }).optional(),
  lookingFor: z.string().optional(),
  relationshipStatus: z.string().optional(),
  cigarettes: z.boolean().optional(),
  alcohol: z.boolean().optional(),
  sport: z.boolean().optional(),
  favoriteDay: z.string().min(1).optional(),
  spirituality: z
    .string()
    .max(300, { message: 'Polje ne smije biti dulje od 300 znakova.' })
    .optional(),
  embarasement: z
    .string()
    .max(500, { message: 'Polje ne smije biti dulje od 500 znakova.' })
    .optional(),
  tooOldFor: z
    .string()
    .max(500, { message: 'Polje ne smije biti dulje od 500 znakova.' })
    .optional(),
  makesMyDay: z
    .string()
    .max(500, { message: 'Polje ne smije biti dulje od 500 znakova.' })
    .optional(),
  favoriteSong: z
    .string()
    .refine(
      (val) => {
        if (val === '') return true;
        try {
          const url = new URL(val);
          return (
            url.hostname === 'www.youtube.com' ||
            url.hostname === 'youtube.com' ||
            url.hostname === 'youtu.be'
          );
        } catch {
          return false;
        }
      },
      {
        message: 'Mora biti YouTube link (youtube.com ili youtu.be)',
      }
    )
    .optional(),
  favoriteMovie: z
    .string()
    .refine(
      (val) => {
        if (val === '') return true;
        try {
          const url = new URL(val);
          return (
            url.hostname === 'www.youtube.com' ||
            url.hostname === 'youtube.com' ||
            url.hostname === 'youtu.be'
          );
        } catch {
          return false;
        }
      },
      {
        message: 'Mora biti YouTube link (youtube.com ili youtu.be)',
      }
    )
    .optional(),
  interests: z
    .string()
    .max(200, { message: 'Polje ne smije biti dulje od 200 znakova.' })
    .optional(),
  languages: z
    .string()
    .max(200, { message: 'Polje ne smije biti dulje od 200 znakova.' })
    .optional(),
  ending: z.string().max(500, { message: 'Polje ne smije biti dulje od 500 znakova.' }).optional(),
});

const tabClassName =
  'cursor-pointer rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition-colors focus:outline-none';
const selectedTabClassName = 'bg-blue text-white shadow-sm';

const EditMyProfilePage = () => {
  const { user: currentUser } = useGetCurrentUser();
  const { updateUserMutation } = useUpdateUser();
  const {
    register,
    handleSubmit,
    formState: { isValid },
    reset,
    control,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (currentUser) {
      reset({
        bio: currentUser.data.bio || '',
        location:
          cityOptions.find((option) => option.value === currentUser.data.location)?.value || '',
        sexuality: currentUser.data.sexuality || '',
        gender: currentUser.data.gender || '',
        lookingFor:
          lookingForOptions.find((option) => option.value === currentUser.data.lookingFor)?.value ||
          '',
        relationshipStatus: currentUser.data.relationshipStatus || '',
        cigarettes: currentUser.data.cigarettes || false,
        alcohol: currentUser.data.alcohol || false,
        sport: currentUser.data.sports || false,
        favoriteDay: daysOfWeek.find(
          (option) => option.value === currentUser.data.favoriteDayOfWeek
        )?.value,
        spirituality: currentUser.data.spirituality || '',
        embarasement: currentUser.data.embarasement || '',
        tooOldFor: currentUser.data.tooOldFor || '',
        makesMyDay: currentUser.data.makesMyDay || '',
        favoriteSong: currentUser.data.favoriteSong || '',
        favoriteMovie: currentUser.data.favoriteMovie || '',
        interests: currentUser.data.interests || '',
        languages: currentUser.data.languages || '',
        ending: currentUser.data.ending || '',
      });
    }
  }, [currentUser, reset]);

  const onSubmitForm: SubmitHandler<Inputs> = (data) => {
    if (isValid) {
      updateUserMutation({
        ...data,
      });
    }
  };

  return (
    <AppLayout>
      <Tabs selectedTabClassName={selectedTabClassName}>
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Uredi profil</h1>
          </div>

          <TabList className="flex flex-wrap gap-2 rounded-2xl border border-[#dce4ff] bg-white p-2 shadow-sm">
            <Tab className={tabClassName}>
              <div className="flex items-center gap-2">
                Općenito <BiSolidFile fontSize={20} />
              </div>
            </Tab>

            <Tab className={tabClassName}>
              <div className="flex items-center gap-2">
                Fotografije <BiSolidCamera fontSize={20} />
              </div>
            </Tab>
          </TabList>
        </div>

        <TabPanel>
          <Card className="rounded-2xl p-5 md:p-7">
            <form className="space-y-5" onSubmit={handleSubmit(onSubmitForm)}>
              <div className="max-w-3xl rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    type="text"
                    className="!bg-gray-100"
                    placeholder="Korisničko ime"
                    value={currentUser?.data.username}
                    label="Korisničko ime"
                    disabled
                  />
                  <Input
                    type="text"
                    className="!bg-gray-100"
                    placeholder="Godine"
                    value={currentUser?.data?.age}
                    label="Dob"
                    disabled
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Label>Lokacija</Label>
                        <Select
                          isClearable
                          {...field}
                          options={cityOptions}
                          placeholder="Tvoja lokacija otprilike..."
                          theme={(theme) => ({
                            ...theme,
                            colors: {
                              ...theme.colors,
                              primary25: '#dce4ff',
                              primary: '#2D46B9',
                            },
                          })}
                          value={cityOptions.find((option) => option.value === field.value) || null}
                          onChange={(selectedOption) =>
                            field.onChange(selectedOption ? selectedOption.value : null)
                          }
                        />
                      </>
                    )}
                  />
                  <Input type="text" placeholder="Rod" {...register('gender')} label="Rod" />
                  {errors.gender?.message && <FieldError message={errors.gender.message} />}
                  <Input
                    label="Seksualnost"
                    type="text"
                    placeholder="Seksualnost"
                    {...register('sexuality')}
                  />
                  {errors.sexuality?.message && <FieldError message={errors.sexuality.message} />}
                </div>

                <div className="mt-4">
                  <Label>Jedna rečenica o meni</Label>
                  <Input
                    type="text"
                    placeholder="Reci nešto o sebi jednom rečenicom"
                    {...register('bio')}
                  />
                  {errors.bio?.message && <FieldError message={errors.bio.message} />}
                </div>
              </div>

              <div className="max-w-3xl rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Controller
                    name="lookingFor"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Label>Trenutno tražim</Label>
                        <Select
                          isClearable
                          {...field}
                          options={lookingForOptions}
                          placeholder="Trenutno tražim..."
                          theme={(theme) => ({
                            ...theme,
                            colors: {
                              ...theme.colors,
                              primary25: '#dce4ff',
                              primary: '#2D46B9',
                            },
                          })}
                          value={
                            lookingForOptions.find((option) => option.value === field.value) || null
                          }
                          onChange={(selectedOption) =>
                            field.onChange(selectedOption ? selectedOption.value : null)
                          }
                        />
                      </>
                    )}
                  />
                  <Controller
                    name="relationshipStatus"
                    control={control}
                    rules={{
                      validate: (value) =>
                        value === undefined || value === null || value.length > 1 || true,
                    }}
                    render={({ field }) => (
                      <>
                        <Label> Trenutni status veze</Label>
                        <Select
                          isClearable
                          {...field}
                          options={relationshipStatusOptions}
                          placeholder="Trenutno sam..."
                          theme={(theme) => ({
                            ...theme,
                            colors: {
                              ...theme.colors,
                              primary25: '#dce4ff',
                              primary: '#2D46B9',
                            },
                          })}
                          value={
                            relationshipStatusOptions.find(
                              (option) => option.value === field.value
                            ) || null
                          }
                          onChange={(selectedOption) =>
                            field.onChange(selectedOption ? selectedOption.value : null)
                          }
                        />
                      </>
                    )}
                  />
                </div>
              </div>

              <div className="max-w-3xl rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] p-4">
                <div className="mb-3">
                  <Label>Zdravstveni i životni stil</Label>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Controller
                    name="cigarettes"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-gray-800">
                        <input
                          type="checkbox"
                          {...field}
                          value={currentUser?.data.cigarettes || false}
                        />
                        <span>Cigarete</span>
                      </label>
                    )}
                  />
                  <Controller
                    name="alcohol"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-gray-800">
                        <input
                          type="checkbox"
                          {...field}
                          value={currentUser?.data.alcohol || false}
                        />
                        <span>Alkohol</span>
                      </label>
                    )}
                  />
                  <Controller
                    name="sport"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-gray-800">
                        <input
                          type="checkbox"
                          {...field}
                          value={currentUser?.data.sport || false}
                        />
                        <span>Sport</span>
                      </label>
                    )}
                  />
                </div>
              </div>

              <div className="max-w-3xl rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] p-4">
                <Controller
                  name="favoriteDay"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Label>Moj najdraži dan u tjednu</Label>
                      <Select
                        isClearable
                        {...field}
                        options={daysOfWeek}
                        placeholder="Najdraži dan u tjednu"
                        theme={(theme) => ({
                          ...theme,
                          colors: {
                            ...theme.colors,
                            primary25: '#dce4ff',
                            primary: '#2D46B9',
                          },
                        })}
                        value={daysOfWeek.find((option) => option.value === field.value) || null}
                        onChange={(selectedOption) =>
                          field.onChange(selectedOption ? selectedOption.value : null)
                        }
                      />
                    </>
                  )}
                />
              </div>

              <div className="max-w-3xl rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] p-4">
                <Label>Najsramotnija stvar koja mi se dogodila</Label>
                <TextArea
                  className="mb-4"
                  placeholder="Najsramotnija stvar koja mi se dogodila..."
                  {...register('embarasement')}
                />
                {errors.embarasement?.message && (
                  <FieldError message={errors.embarasement.message} />
                )}

                <Label>Imam previše godina za...</Label>
                <TextArea
                  className="mb-4"
                  placeholder="Imam previše godina za...."
                  {...register('tooOldFor')}
                />
                {errors.tooOldFor?.message && <FieldError message={errors.tooOldFor.message} />}

                <Label>Stvari koje mi uljepšavaju dan</Label>
                <TextArea
                  className="mb-4"
                  placeholder="Dan mi je ljepši ako..."
                  {...register('makesMyDay')}
                />
                {errors.makesMyDay?.message && <FieldError message={errors.makesMyDay.message} />}

                <Input
                  label={
                    <div className="flex items-center gap-1">
                      <span>Unesi svoju najdražu pjesmu sa Youtube-a</span>
                      <span data-tooltip-id="youtubesong">
                        <BiInfoCircle fontSize={20} />
                      </span>
                      <Tooltip
                        id="youtubesong"
                        style={{
                          backgroundColor: 'black',
                          color: 'white',
                        }}
                      >
                        Unesi link u formatu <code>https://www.youtube.com/embed/</code>
                      </Tooltip>
                    </div>
                  }
                  type="text"
                  className="mb-2"
                  placeholder="Najdraža youtube pjesma (https://www.youtube.com/embed/)"
                  {...register('favoriteSong')}
                  error={errors.favoriteSong?.message}
                />

                <Input
                  label={
                    <div className="flex items-center gap-1">
                      <span>Unesi svoju najdraži film sa Youtube-a</span>
                      <span data-tooltip-id="youtubetrailer">
                        <BiInfoCircle fontSize={20} />
                      </span>
                      <Tooltip
                        id="youtubetrailer"
                        style={{
                          backgroundColor: 'black',
                          color: 'white',
                        }}
                      >
                        Unesi link u formatu <code>https://www.youtube.com/embed/</code>
                      </Tooltip>
                    </div>
                  }
                  type="text"
                  className="mb-2"
                  placeholder="Trailer za najdraži film (https://www.youtube.com/embed/)"
                  {...register('favoriteMovie')}
                  error={errors.favoriteMovie?.message}
                />
              </div>

              <div className="max-w-3xl rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] p-4">
                <Label>Duhovnost/religioznost</Label>
                <TextArea
                  placeholder="Reci nam nešto o svojoj duhovnosti/religioznosti"
                  {...register('spirituality')}
                />
                {errors.spirituality?.message && (
                  <FieldError message={errors.spirituality.message} />
                )}
              </div>

              <div className="max-w-3xl rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] p-4">
                <Input
                  type="text"
                  className="mb-2"
                  placeholder="Interesi (odvojeni zarezom)"
                  {...register('interests')}
                  label="Interesi"
                />
                {errors.interests?.message && <FieldError message={errors.interests.message} />}

                <Input
                  type="text"
                  className="mb-2"
                  placeholder="Jezici koje govorim (odvojeni zarezom)"
                  {...register('languages')}
                  label="Jezici"
                />
                {errors.languages?.message && <FieldError message={errors.languages.message} />}

                <Label>Za kraj, još nešto o meni</Label>
                <TextArea placeholder="Za kraj još nešto o meni" {...register('ending')} />
                {errors.ending?.message && <FieldError message={errors.ending.message} />}
              </div>

              <div className="max-w-3xl">
                <Button type="blue" className="w-full">
                  Spremi
                </Button>
              </div>
            </form>
          </Card>
        </TabPanel>

        <TabPanel>
          <PhotoUploader />
        </TabPanel>
      </Tabs>
    </AppLayout>
  );
};

export default EditMyProfilePage;
