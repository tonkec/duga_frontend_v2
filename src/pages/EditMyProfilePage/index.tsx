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
import Image from '@app/components/Image';
import data from '@emoji-mart/data';
import { init } from 'emoji-mart';
import { useQuery } from '@tanstack/react-query';
import { searchImdbTitles, ImdbTitle } from '@app/api/imdb';
import { searchYouTubeVideos, YouTubeVideo } from '@app/api/youtube';
import {
  getEmojiSearchQueryFromText,
  replaceEmojiToken,
  searchEmojiNatives,
} from '@app/utils/emojis';
import { getImdbTitleUrl, isImdbTitleUrl } from '@app/utils/imdb';
import { getYouTubeEmbedUrl } from '@app/utils/youtube';

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
  cigarettes?: boolean;
  alcohol?: boolean;
  sport?: boolean;
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
    .refine((val) => val === '' || isImdbTitleUrl(val), {
      message: 'Odaberi film iz IMDb pretrage',
    })
    .optional(),
  interests: maxProfileTextLength(200),
  languages: maxProfileTextLength(200),
  ending: maxProfileTextLength(500),
});

const getOptionalBoolean = (value: unknown) => (typeof value === 'boolean' ? value : undefined);

const tabClassName =
  'shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-gray-600 transition-colors focus:outline-none';
const selectedTabClassName = 'bg-blue text-white shadow-sm';
const editProfileTabs = [
  { label: 'Općenito', icon: <BiSolidFile fontSize={20} /> },
  { label: 'Fotografije', icon: <BiSolidCamera fontSize={20} /> },
];

const ImdbMovieSearch = ({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearchTerm(searchTerm.trim()), 500);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  const {
    data: imdbTitles = [],
    error: imdbError,
    isPending: isImdbLoading,
  } = useQuery({
    queryKey: ['imdbTitles', debouncedSearchTerm],
    queryFn: () => searchImdbTitles(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length >= 2,
    retry: false,
  });

  const handleMovieSelect = (movie: ImdbTitle) => {
    onChange(movie.url);
    setSearchTerm(movie.year ? `${movie.title} (${movie.year})` : movie.title);
  };

  return (
    <div className="mb-2">
      <div className="mb-2 flex items-center gap-1">
        <Label>Pretraži svoj najdraži film na IMDb-u</Label>
        <span data-tooltip-id="imdbmovie">
          <BiInfoCircle fontSize={20} />
        </span>
        <Tooltip
          id="imdbmovie"
          style={{
            backgroundColor: 'black',
            color: 'white',
          }}
        >
          Odaberi film iz IMDb rezultata pretrage.
        </Tooltip>
      </div>

      <Input
        type="text"
        className="h-12 rounded-2xl border-[#dce4ff] px-4 text-base shadow-sm"
        placeholder="Pretraži IMDb film..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />

      {error && <FieldError message={error} />}

      {value && (
        <div className="mt-2 rounded-xl border border-[#dce4ff] bg-white px-3 py-2 text-sm text-gray-700">
          Odabrani IMDb film:{' '}
          <a href={value} target="_blank" rel="noreferrer" className="font-semibold text-blue">
            {value}
          </a>
        </div>
      )}

      {debouncedSearchTerm.length >= 2 && (
        <div className="mt-2 rounded-2xl border border-[#dce4ff] bg-white p-3 shadow-sm">
          {isImdbLoading ? (
            <div className="py-4 text-center text-gray-500">Pretražujem IMDb...</div>
          ) : imdbError ? (
            <div className="py-4 text-center text-red-500">{imdbError.message}</div>
          ) : imdbTitles.length > 0 ? (
            <div className="grid max-h-72 gap-2 overflow-y-auto">
              {imdbTitles.map((movie) => (
                <button
                  key={movie.id}
                  type="button"
                  onClick={() => handleMovieSelect(movie)}
                  className="flex items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-[#f0f4ff]"
                >
                  {movie.imageUrl && (
                    <Image
                      src={movie.imageUrl}
                      alt={movie.title}
                      className="h-16 w-12 rounded object-cover"
                    />
                  )}
                  <span>
                    <span className="block font-semibold text-gray-900">{movie.title}</span>
                    {movie.year && <span className="text-sm text-gray-500">{movie.year}</span>}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">Nema pronađenih filmova</div>
          )}
        </div>
      )}
    </div>
  );
};

const YouTubeSongSearch = ({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearchTerm(searchTerm.trim()), 500);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  const {
    data: youtubeVideos = [],
    error: youtubeError,
    isPending: isYouTubeLoading,
  } = useQuery({
    queryKey: ['youtubeVideos', debouncedSearchTerm],
    queryFn: () => searchYouTubeVideos(debouncedSearchTerm),
    enabled: debouncedSearchTerm.length >= 2,
    retry: false,
  });

  const handleSongSelect = (video: YouTubeVideo) => {
    onChange(video.url);
    setSearchTerm(video.channelTitle ? `${video.title} - ${video.channelTitle}` : video.title);
  };

  const handleSongClear = () => {
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center gap-1">
        <Label>Unesi svoju najdražu pjesmu sa Youtube-a</Label>
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
          Pretraži YouTube i odaberi pjesmu iz rezultata.
        </Tooltip>
      </div>

      <Input
        type="text"
        className="h-12 rounded-2xl border-[#dce4ff] px-4 text-base shadow-sm"
        placeholder="Pretraži YouTube pjesmu..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />

      {error && <FieldError message={error} />}

      {value && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#dce4ff] bg-white px-3 py-2 text-sm text-gray-700">
          <span>
            Odabrana YouTube pjesma:{' '}
            <a href={value} target="_blank" rel="noreferrer" className="font-semibold text-blue">
              {value}
            </a>
          </span>
          <button type="button" onClick={handleSongClear} className="font-semibold text-red-500">
            Ukloni
          </button>
        </div>
      )}

      {debouncedSearchTerm.length >= 2 && (
        <div className="mt-2 rounded-2xl border border-[#dce4ff] bg-white p-3 shadow-sm">
          {isYouTubeLoading ? (
            <div className="py-4 text-center text-gray-500">Pretražujem YouTube...</div>
          ) : youtubeError ? (
            <div className="py-4 text-center text-red-500">{youtubeError.message}</div>
          ) : youtubeVideos.length > 0 ? (
            <div className="grid max-h-72 gap-2 overflow-y-auto">
              {youtubeVideos.map((video) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => handleSongSelect(video)}
                  className="flex items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-[#f0f4ff]"
                >
                  {video.thumbnailUrl && (
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="h-16 w-24 rounded object-cover"
                    />
                  )}
                  <span>
                    <span className="block font-semibold text-gray-900">{video.title}</span>
                    {video.channelTitle && (
                      <span className="text-sm text-gray-500">{video.channelTitle}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">Nema pronađenih pjesama</div>
          )}
        </div>
      )}
    </div>
  );
};

const EditMyProfilePage = () => {
  init({ data });

  const { user: currentUser } = useGetCurrentUser();
  const { updateUserMutation } = useUpdateUser();
  const [activeEmojiField, setActiveEmojiField] = useState<EmojiFieldName | null>(null);
  const [currentEmojis, setCurrentEmojis] = useState<string[]>([]);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const {
    register,
    handleSubmit,
    formState: { dirtyFields, isValid },
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });
  const favoriteSong = watch('favoriteSong') || '';
  const favoriteMovie = watch('favoriteMovie') || '';

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
        cigarettes: getOptionalBoolean(currentUser.data.cigarettes),
        alcohol: getOptionalBoolean(currentUser.data.alcohol),
        sport: getOptionalBoolean(currentUser.data.sport ?? currentUser.data.sports),
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
      const lifestyleFields = {
        ...(dirtyFields.cigarettes || typeof currentUser?.data?.cigarettes === 'boolean'
          ? { cigarettes: data.cigarettes ?? false }
          : {}),
        ...(dirtyFields.alcohol || typeof currentUser?.data?.alcohol === 'boolean'
          ? { alcohol: data.alcohol ?? false }
          : {}),
        ...(dirtyFields.sport ||
        typeof (currentUser?.data?.sport ?? currentUser?.data?.sports) === 'boolean'
          ? { sport: data.sport ?? false }
          : {}),
      };

      updateUserMutation({
        ...data,
        ...lifestyleFields,
        age: data.age || currentUser?.data?.age || '',
        favoriteDay: data.favoriteDay || currentUser?.data?.favoriteDayOfWeek || '',
        favoriteSong: data.favoriteSong ? getYouTubeEmbedUrl(data.favoriteSong) || '' : '',
        favoriteMovie: data.favoriteMovie ? getImdbTitleUrl(data.favoriteMovie) || '' : '',
      });
    }
  };

  const handleEmojiSearch = async (fieldName: EmojiFieldName, value: string) => {
    const searchTerm = getEmojiSearchQueryFromText(value);

    if (searchTerm) {
      const emojis = await searchEmojiNatives(searchTerm);
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
          onChange(replaceEmojiToken(value, emoji));
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
      <Tabs
        selectedIndex={selectedTabIndex}
        onSelect={(index) => setSelectedTabIndex(index)}
        selectedTabClassName={selectedTabClassName}
      >
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Uredi profil</h1>
          </div>

          <label className="block lg:hidden">
            <span className="sr-only">Odaberi sekciju uređivanja profila</span>
            <Select
              value={editProfileTabs[selectedTabIndex]}
              onChange={(option) => {
                const nextIndex = editProfileTabs.findIndex((tab) => tab.label === option?.label);
                if (nextIndex >= 0) {
                  setSelectedTabIndex(nextIndex);
                }
              }}
              options={editProfileTabs}
              styles={selectStyles}
              classNamePrefix="react-select"
              isSearchable={false}
            />
          </label>

          <TabList className="hidden w-full max-w-full flex-nowrap gap-2 overflow-x-auto rounded-2xl border border-[#dce4ff] bg-white p-2 shadow-sm lg:flex lg:w-auto lg:flex-wrap">
            {editProfileTabs.map((tab) => (
              <Tab key={tab.label} className={tabClassName}>
                <div className="flex items-center gap-2">
                  {tab.label} {tab.icon}
                </div>
              </Tab>
            ))}
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
                          classNamePrefix="react-select"
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
                          classNamePrefix="react-select"
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
                          classNamePrefix="react-select"
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
                        classNamePrefix="react-select"
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

                <YouTubeSongSearch
                  value={favoriteSong}
                  error={errors.favoriteSong?.message}
                  onChange={(songUrl) =>
                    setValue('favoriteSong', songUrl, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
                <input type="hidden" {...register('favoriteSong')} />

                <ImdbMovieSearch
                  value={favoriteMovie}
                  error={errors.favoriteMovie?.message}
                  onChange={(movieUrl) =>
                    setValue('favoriteMovie', movieUrl, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
                <input type="hidden" {...register('favoriteMovie')} />
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
