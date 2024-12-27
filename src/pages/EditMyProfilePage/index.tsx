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
};

const schema = z.object({
  bio: z.string().min(2),
  age: z.number().int(),
  location: z.string().min(2),
  sexuality: z.string().min(2),
  gender: z.string().min(2),
  username: z.string().min(2),
  lookingFor: z.string().min(2),
  relationshipStatus: z.string().min(2),
  cigarettes: z.boolean(),
  alcohol: z.boolean(),
  sport: z.boolean(),
  favoriteDay: z.string().min(1),
  spirituality: z.string().min(2),
  embarasement: z.string().min(2),
  tooOldFor: z.string().min(2),
  makesMyDay: z.string().min(2),
  favoriteSong: z.string().min(2),
  favoriteMovie: z.string().min(2),
});

const EditMyProfilePage = () => {
  const [userId] = useLocalStorage('userId');
  const { user: currentUser } = useGetUserById(userId as string);
  const { updateUserMutation } = useUpdateUser();
  const {
    register,
    handleSubmit,
    formState: { isValid },
    reset,
    control,
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
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
      });
    }
  }, [currentUser, reset]);

  const onSubmitForm: SubmitHandler<Inputs> = (data) => {
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
                    defaultValue={currentUser?.data.lookingFor}
                    render={({ field }) => (
                      <Select
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
                    defaultValue={currentUser?.data.relationshipStatus}
                    render={({ field }) => (
                      <Select
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
                    defaultValue={currentUser?.data.favoriteDayOfWeek}
                    render={({ field }) => (
                      <Select
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
                    placeholder="Najdraža youtube pjesma (youtube link)"
                    {...register('favoriteSong')}
                  />
                  <Input
                    className="mb-2"
                    placeholder="Trailer za najdraži film (youtube link)"
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
                  <Input className="mb-2" placeholder="Interesi" />
                  <Input className="mb-2" placeholder="Jezici koje govorim" />
                  <TextArea placeholder="Za kraj još nešto o meni" />
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
