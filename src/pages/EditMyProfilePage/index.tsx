import { BiInfoCircle, BiSolidCamera, BiSolidFile } from 'react-icons/bi';
import AppLayout from '@app/components/AppLayout';
import Card from '@app/components/Card';
import PhotoUploader from '@app/components/PhotoUploader';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Input from '@app/components/Input';
import Select from 'react-select';
import TextArea from '@app/components/Textarea';
import { useGetUserById } from '@app/hooks/useGetUserById';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useUpdateUser } from './hooks';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import Button from '@app/components/Button';
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';
import Label from '@app/components/Label';

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
  bio: z.string().optional(),
  age: z.string().optional(),
  location: z.string().optional(),
  sexuality: z.string().optional(),
  gender: z.string().optional(),
  username: z.string().optional(),
  lookingFor: z.string().optional(),
  relationshipStatus: z.string().optional(),
  cigarettes: z.boolean().optional(),
  alcohol: z.boolean().optional(),
  sport: z.boolean().optional(),
  favoriteDay: z.string().min(1).optional(),
  spirituality: z.string().optional(),
  embarasement: z.string().optional(),
  tooOldFor: z.string().optional(),
  makesMyDay: z.string().optional(),
  favoriteSong: z
    .string()
    .refine((val) => val === '' || z.string().url().safeParse(val).success, {
      message: 'Unesite ispravan URL za najdražu pjesmu',
    })
    .optional(),
  favoriteMovie: z
    .string()
    .refine((val) => val === '' || z.string().url().safeParse(val).success, {
      message: 'Unesite ispravan URL za trailer filma',
    })
    .optional(),
  interests: z.string().optional(),
  languages: z.string().optional(),
  ending: z.string().optional(),
});

const EditMyProfilePage = () => {
  const [userId] = useLocalStorage('userId');
  const { user: currentUser } = useGetUserById(userId as string);
  const { updateUserMutation } = useUpdateUser(userId as string);
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
        username: currentUser.data.username || '',
        bio: currentUser.data.bio || '',
        age: String(currentUser.data.age ?? '0'),
        location: currentUser.data.location || '',
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
        username: data?.username?.toLowerCase() || '',
      });
    }
  };

  return (
    <AppLayout>
      <Tabs selectedTabClassName="bg-black text-white rounded-t-md">
        <TabList style={{ borderBottom: 'none', marginBottom: 0 }}>
          <Tab style={{ border: 'none' }}>
            <div className="flex items-center gap-1">
              Općenito <BiSolidFile fontSize={25} />
            </div>
          </Tab>

          <Tab>
            <div className="flex items-center gap-1">
              Fotografije <BiSolidCamera fontSize={25} />
            </div>
          </Tab>
        </TabList>

        <TabPanel>
          <Card>
            <form onSubmit={handleSubmit(onSubmitForm)}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
                <div className="col-span-2">
                  <Input
                    type="text"
                    className="mb-2"
                    placeholder="Korisničko ime"
                    {...register('username')}
                    label="Korisničko ime"
                  />
                  <Input
                    type="text"
                    className="mb-2"
                    placeholder="Lokacija"
                    label="Lokacija"
                    {...register('location')}
                  />
                  <Input
                    type="text"
                    className="mb-2"
                    placeholder="Rod"
                    {...register('gender')}
                    label="Rod"
                  />
                  <Input
                    label="Seksualnost"
                    type="text"
                    className="mb-2"
                    placeholder="Seksualnost"
                    {...register('sexuality')}
                  />
                  <Input
                    type="text"
                    className="mb-2"
                    placeholder="Godine"
                    {...register('age')}
                    label="Dob"
                  />
                  <Label>Biografija</Label>
                  <TextArea placeholder="Nešto ukratko o tebi" {...register('bio')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
                <div className="col-span-2">
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
                          className="mb-2"
                          theme={(theme) => ({
                            ...theme,
                            colors: {
                              ...theme.colors,
                              primary25: '#F037A5',
                              primary: 'black',
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
                          className="mb-2"
                          theme={(theme) => ({
                            ...theme,
                            colors: {
                              ...theme.colors,
                              primary25: '#F037A5',
                              primary: 'black',
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                <div className="col-span-2">
                  <Label>Zdravstveni i životni stil</Label>
                  <Controller
                    name="cigarettes"
                    control={control}
                    render={({ field }) => (
                      <>
                        <input
                          type="checkbox"
                          {...field}
                          value={currentUser?.data.cigarettes || false}
                        />{' '}
                        Cigarete
                      </>
                    )}
                  />
                </div>
                <div className="col-span-2">
                  <Controller
                    name="alcohol"
                    control={control}
                    render={({ field }) => (
                      <>
                        <input
                          type="checkbox"
                          {...field}
                          value={currentUser?.data.alcohol || false}
                        />{' '}
                        Alkohol
                      </>
                    )}
                  />
                </div>
                <div className="col-span-2">
                  <Controller
                    name="sport"
                    control={control}
                    render={({ field }) => (
                      <>
                        <input
                          type="checkbox"
                          {...field}
                          value={currentUser?.data.sport || false}
                        />{' '}
                        Sport
                      </>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
                <div className="col-span-2">
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
                          className="mb-2"
                          theme={(theme) => ({
                            ...theme,
                            colors: {
                              ...theme.colors,
                              primary25: '#F037A5',
                              primary: 'black',
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
                <div className="col-span-2">
                  <Label>Najsramotnija stvar koja mi se dogodila</Label>
                  <TextArea
                    className="mb-4"
                    placeholder="Najsramotnija stvar koja mi se dogodila..."
                    {...register('embarasement')}
                  />
                  <Label>Imam previše godina za...</Label>
                  <TextArea
                    className="mb-4"
                    placeholder="Imam previše godina za...."
                    {...register('tooOldFor')}
                  />
                  <Label>Stvari koje mi uljepšavaju dan</Label>
                  <TextArea
                    className="mb-4"
                    placeholder="Dan mi je ljepši ako..."
                    {...register('makesMyDay')}
                  />
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
                <div className="col-span-2">
                  <Label>Duhovnost/religioznost</Label>
                  <TextArea
                    className="mb-2"
                    placeholder="Reci nam nešto o svojoj duhovnosti/religioznosti"
                    {...register('spirituality')}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
                <div className="col-span-2">
                  <Input
                    type="text"
                    className="mb-2"
                    placeholder="Interesi (odvojeni zarezom)"
                    {...register('interests')}
                    label="Interesi"
                  />
                  <Input
                    type="text"
                    className="mb-2"
                    placeholder="Jezici koje govorim (odvojeni zarezom)"
                    {...register('languages')}
                    label="Jezici"
                  />
                  <Label>Za kraj, još nešto o meni</Label>
                  <TextArea placeholder="Za kraj još nešto o meni" {...register('ending')} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3 mt-3">
                <div className="col-span-2">
                  <Button type="primary" className="mt-4 w-full">
                    Spremi
                  </Button>
                </div>
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
