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
import { useEffect, useState } from 'react';
import Button from '@app/components/Button';
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';
import Label from '@app/components/Label';
import { useGetCurrentUser } from '@app/hooks/useGetCurrentUser';
import { cityOptions } from '@app/consts/cityOptions';
import FieldError from '@app/components/FieldError';
import EmojiPicker from '@app/components/EmojiPicker';
import data from '@emoji-mart/data';
import { init, SearchIndex } from 'emoji-mart';

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

interface IEmoji {
  skins: {
    native: string;
  }[];
}

type EmojiFieldName =
  | 'gender'
  | 'sexuality'
  | 'bio'
  | 'spirituality'
  | 'embarasement'
  | 'tooOldFor'
  | 'makesMyDay'
  | 'interests'
  | 'languages'
  | 'ending';

const EMOJI_SHORTCODE_REGEX = /(?:\s|^):([^\s:]+)/;

const selectStyles = {
  control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    minHeight: '3rem',
    borderRadius: '1rem',
    borderColor: state.isFocused ? '#2D46B9' : '#dce4ff',
    boxShadow: state.isFocused ? '0 0 0 1px #2D46B9' : '0 1px 2px rgba(15, 23, 42, 0.05)',
    '&:hover': {
      borderColor: '#2D46B9',
    },
  }),
  valueContainer: (base: Record<string, unknown>) => ({
    ...base,
    padding: '0 0.875rem',
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    borderRadius: '1rem',
    overflow: 'hidden',
    border: '1px solid #dce4ff',
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
  }),
  option: (base: Record<string, unknown>, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...base,
    backgroundColor: state.isSelected ? '#2D46B9' : state.isFocused ? '#f0f4ff' : 'white',
    color: state.isSelected ? 'white' : '#111827',
  }),
};

const searchEmojis = async (value: string) => {
  const emojis = await SearchIndex.search(value);
  return emojis.map((emoji: IEmoji) => emoji.skins[0].native);
};

const maxProfileTextLength = (maxLength: number) =>
  z
    .string()
    .refine((value) => Array.from(value).length <= maxLength, {
      message: `Polje ne smije biti dulje od ${maxLength} znakova.`,
    })
    .optional();

const schema = z.object({
  bio: maxProfileTextLength(100),
  location: z.string().nullable().optional(),
  sexuality: z.string().optional(),
  gender: maxProfileTextLength(100),
  lookingFor: z.string().optional(),
  relationshipStatus: z.string().optional(),
  cigarettes: z.boolean().optional(),
  alcohol: z.boolean().optional(),
  sport: z.boolean().optional(),
  favoriteDay: z.string().min(1).optional(),
  spirituality: maxProfileTextLength(300),
  embarasement: maxProfileTextLength(500),
  tooOldFor: maxProfileTextLength(500),
  makesMyDay: maxProfileTextLength(500),
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
  interests: maxProfileTextLength(200),
  languages: maxProfileTextLength(200),
  ending: maxProfileTextLength(500),
});

const tabClassName =
  'cursor-pointer rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition-colors focus:outline-none';
const selectedTabClassName = 'bg-blue text-white shadow-sm';

const EditMyProfilePage = () => {
  init({ data });

  const { user: currentUser } = useGetCurrentUser();
  const { updateUserMutation } = useUpdateUser();
  const [activeEmojiField, setActiveEmojiField] = useState<EmojiFieldName | null>(null);
  const [currentEmojis, setCurrentEmojis] = useState<string[]>([]);
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
        sport: currentUser.data.sport || currentUser.data.sports || false,
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

  const handleEmojiSearch = async (fieldName: EmojiFieldName, value: string) => {
    const match = value.match(EMOJI_SHORTCODE_REGEX);

    if (match) {
      const emojis = await searchEmojis(match[1]);
      setActiveEmojiField(fieldName);
      setCurrentEmojis(emojis);
      return;
    }

    setActiveEmojiField(null);
    setCurrentEmojis([]);
  };

  const renderEmojiPicker = (
    fieldName: EmojiFieldName,
    value: string,
    onChange: (value: string) => void
  ) =>
    activeEmojiField === fieldName ? (
      <EmojiPicker
        emojis={currentEmojis}
        onEmojiSelect={(emoji: string) => {
          onChange(value.replace(EMOJI_SHORTCODE_REGEX, emoji));
          setActiveEmojiField(null);
          setCurrentEmojis([]);
        }}
      />
    ) : null;

  const renderEmojiInput = ({
    name,
    placeholder,
    label,
    className,
  }: {
    name: EmojiFieldName;
    placeholder: string;
    label?: string;
    className?: string;
  }) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const value = field.value || '';
        return (
          <div className="relative">
            <Input
              type="text"
              className={`h-12 rounded-2xl border-[#dce4ff] px-4 text-base shadow-sm ${className ?? ''}`}
              placeholder={placeholder}
              label={label}
              name={field.name}
              value={value}
              onBlur={field.onBlur}
              ref={field.ref}
              onChange={(event) => {
                const nextValue = event.target.value;
                field.onChange(nextValue);
                handleEmojiSearch(name, nextValue);
              }}
            />
            {renderEmojiPicker(name, value, field.onChange)}
          </div>
        );
      }}
    />
  );

  const renderEmojiTextArea = ({
    name,
    placeholder,
    className,
  }: {
    name: EmojiFieldName;
    placeholder: string;
    className?: string;
  }) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const value = field.value || '';
        return (
          <div className="relative">
            <TextArea
              className={`rounded-2xl border-[#dce4ff] bg-white text-base shadow-sm focus:border-blue ${className ?? ''}`}
              placeholder={placeholder}
              name={field.name}
              value={value}
              onBlur={field.onBlur}
              ref={field.ref}
              onChange={(event) => {
                const nextValue = event.target.value;
                field.onChange(nextValue);
                handleEmojiSearch(name, nextValue);
              }}
            />
            {renderEmojiPicker(name, value, field.onChange)}
          </div>
        );
      }}
    />
  );

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
                    className="h-12 rounded-2xl border-[#dce4ff] !bg-gray-100 px-4 text-base"
                    placeholder="Korisničko ime"
                    value={currentUser?.data.username}
                    label="Korisničko ime"
                    disabled
                  />
                  <Input
                    type="text"
                    className="h-12 rounded-2xl border-[#dce4ff] !bg-gray-100 px-4 text-base"
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
                          styles={selectStyles}
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
                  {renderEmojiInput({ name: 'gender', placeholder: 'Rod', label: 'Rod' })}
                  {errors.gender?.message && <FieldError message={errors.gender.message} />}
                  {renderEmojiInput({
                    name: 'sexuality',
                    placeholder: 'Seksualnost',
                    label: 'Seksualnost',
                  })}
                  {errors.sexuality?.message && <FieldError message={errors.sexuality.message} />}
                </div>

                <div className="mt-4">
                  <Label>Jedna rečenica o meni</Label>
                  {renderEmojiInput({
                    name: 'bio',
                    placeholder: 'Reci nešto o sebi jednom rečenicom',
                  })}
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
                          styles={selectStyles}
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
                          styles={selectStyles}
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
                          name={field.name}
                          ref={field.ref}
                          checked={Boolean(field.value)}
                          onBlur={field.onBlur}
                          onChange={(event) => field.onChange(event.target.checked)}
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
                          name={field.name}
                          ref={field.ref}
                          checked={Boolean(field.value)}
                          onBlur={field.onBlur}
                          onChange={(event) => field.onChange(event.target.checked)}
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
                          name={field.name}
                          ref={field.ref}
                          checked={Boolean(field.value)}
                          onBlur={field.onBlur}
                          onChange={(event) => field.onChange(event.target.checked)}
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
                        styles={selectStyles}
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
                {renderEmojiTextArea({
                  name: 'embarasement',
                  className: 'mb-4',
                  placeholder: 'Najsramotnija stvar koja mi se dogodila...',
                })}
                {errors.embarasement?.message && (
                  <FieldError message={errors.embarasement.message} />
                )}

                <Label>Imam previše godina za...</Label>
                {renderEmojiTextArea({
                  name: 'tooOldFor',
                  className: 'mb-4',
                  placeholder: 'Imam previše godina za....',
                })}
                {errors.tooOldFor?.message && <FieldError message={errors.tooOldFor.message} />}

                <Label>Stvari koje mi uljepšavaju dan</Label>
                {renderEmojiTextArea({
                  name: 'makesMyDay',
                  className: 'mb-4',
                  placeholder: 'Dan mi je ljepši ako...',
                })}
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
                {renderEmojiTextArea({
                  name: 'spirituality',
                  placeholder: 'Reci nam nešto o svojoj duhovnosti/religioznosti',
                })}
                {errors.spirituality?.message && (
                  <FieldError message={errors.spirituality.message} />
                )}
              </div>

              <div className="max-w-3xl rounded-2xl border border-[#dce4ff] bg-[#f7f9ff] p-4">
                {renderEmojiInput({
                  name: 'interests',
                  className: 'mb-2',
                  placeholder: 'Interesi (odvojeni zarezom)',
                  label: 'Interesi',
                })}
                {errors.interests?.message && <FieldError message={errors.interests.message} />}

                {renderEmojiInput({
                  name: 'languages',
                  className: 'mb-2',
                  placeholder: 'Jezici koje govorim (odvojeni zarezom)',
                  label: 'Jezici',
                })}
                {errors.languages?.message && <FieldError message={errors.languages.message} />}

                <Label>Za kraj, još nešto o meni</Label>
                {renderEmojiTextArea({
                  name: 'ending',
                  placeholder: 'Za kraj još nešto o meni',
                })}
                {errors.ending?.message && <FieldError message={errors.ending.message} />}
              </div>

              <div className="flex max-w-3xl justify-end">
                <Button
                  type="blue"
                  className="w-full rounded-full px-8 py-3 font-semibold shadow-md shadow-blue/20 md:w-auto"
                >
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
