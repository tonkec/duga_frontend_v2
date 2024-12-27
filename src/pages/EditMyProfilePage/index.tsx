import { BiSolidCamera, BiSolidFile } from 'react-icons/bi';
import AppLayout from '../../components/AppLayout';
import Card from '../../components/Card';
import PhotoUploader from '../../components/PhotoUploader';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Input from '../../components/Input';
import Select from 'react-select';
import TextArea from '../../components/Textarea';
import { useGetUserById } from '../../hooks/useGetUserById';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useUpdateUser } from './hooks';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import Button from '../../components/Button';

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
  age: number;
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
  bio: z.string().min(2).optional(),
  age: z.number().int().positive().optional(),
  location: z.string().min(2).optional(),
  sexuality: z.string().min(2).optional(),
  gender: z.string().min(2).optional(),
  username: z.string().min(2).optional(),
  lookingFor: z.string().min(2).optional(),
  relationshipStatus: z.string().min(2).optional(),
  cigarettes: z.boolean().optional(),
  alcohol: z.boolean().optional(),
  sport: z.boolean().optional(),
  favoriteDay: z.string().min(1).optional(),
  spirituality: z.string().min(2).optional(),
  embarasement: z.string().min(2).optional(),
  tooOldFor: z.string().min(2).optional(),
  makesMyDay: z.string().min(2).optional(),
  favoriteSong: z.string().min(2).optional(),
  favoriteMovie: z.string().min(2).optional(),
  interests: z.string().min(2).optional(),
  languages: z.string().min(2).optional(),
  ending: z.string().min(2).optional(),
});

const EditMyProfilePage = () => {
  const [userId] = useLocalStorage('userId');
  const { user: currentUser } = useGetUserById(userId as string);
  const { updateUserMutation } = useUpdateUser();
  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
    reset,
    control,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      relationshipStatus: '',
    },
  });

  useEffect(() => {
    if (currentUser) {
      reset({
        username: currentUser.data.username || '',
        bio: currentUser.data.bio || '',
        age: currentUser.data.age || 0,
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
    console.log(errors);
    if (isValid) {
      updateUserMutation(data);
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
              <h2 className="mb-2">Općenito</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
                <div className="col-span-2">
                  <Input className="mb-2" placeholder="Korisničko ime" {...register('username')} />
                  <Input className="mb-2" placeholder="Lokacija" {...register('location')} />
                  <Input className="mb-2" placeholder="Rod" {...register('gender')} />
                  <Input className="mb-2" placeholder="Seksualnost" {...register('sexuality')} />
                  <Input className="mb-2" placeholder="Godine" {...register('age')} />
                  <TextArea placeholder="Nešto ukratko o tebi" {...register('bio')} />
                </div>
              </div>

              <h2 className="mb-2">Tražim...</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
                <div className="col-span-2">
                  <Controller
                    name="lookingFor"
                    control={control}
                    render={({ field }) => (
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
                    )}
                  />
                </div>
              </div>
              <h2 className="mb-2">Stil života</h2>
              <div className="flex grid-cols-1 md:grid-cols-3 gap-5 mb-3">
                <div className="col-span-2">
                  <Controller
                    name="cigarettes"
                    control={control}
                    render={({ field }) => (
                      <>
                        <input
                          type="checkbox"
                          {...field}
                          value={currentUser?.data.cigarettes || false}
                          checked={currentUser?.data.cigarettes || false}
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
                          checked={currentUser?.data.alcohol || false}
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
                          checked={currentUser?.data.sport || false}
                        />{' '}
                        Sport
                      </>
                    )}
                  />
                </div>
              </div>

              <h2 className="mb-2">Fun facts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
                <div className="col-span-2">
                  <Controller
                    name="favoriteDay"
                    control={control}
                    render={({ field }) => (
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
                    )}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
                <div className="col-span-2">
                  <TextArea
                    className="mb-4"
                    placeholder="Najsramotnija stvar koja mi se dogodila..."
                    {...register('embarasement')}
                  />
                  <TextArea
                    className="mb-4"
                    placeholder="Imam previše godina za...."
                    {...register('tooOldFor')}
                  />
                  <TextArea
                    className="mb-4"
                    placeholder="Dan mi je ljepši ako..."
                    {...register('makesMyDay')}
                  />
                  <Input
                    className="mb-2"
                    placeholder="Najdraža youtube pjesma (https://www.youtube.com/embed/)"
                    {...register('favoriteSong')}
                  />
                  <Input
                    className="mb-2"
                    placeholder="Trailer za najdraži film (https://www.youtube.com/embed/)"
                    {...register('favoriteMovie')}
                  />
                </div>
              </div>
              <h2 className="mb-2">Ostalo</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
                <div className="col-span-2">
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
                    className="mb-2"
                    placeholder="Interesi (odvojeni zarezom)"
                    {...register('interests')}
                  />
                  <Input
                    className="mb-2"
                    placeholder="Jezici koje govorim (odvojeni zarezom)"
                    {...register('languages')}
                  />
                  <TextArea placeholder="Za kraj još nešto o meni" {...register('ending')} />
                </div>
              </div>
              <Button type="primary" className="mt-4">
                Spremi
              </Button>
            </form>
          </Card>
        </TabPanel>

        <TabPanel>
          <Card>
            <PhotoUploader />
          </Card>
        </TabPanel>
      </Tabs>
    </AppLayout>
  );
};

export default EditMyProfilePage;
