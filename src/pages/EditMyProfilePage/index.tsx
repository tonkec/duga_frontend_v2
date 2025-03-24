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
import { useDeleteUser, useUpdateUser } from './hooks';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import ConfirmModal from '../../components/ConfirmModal';

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
  favoriteSong: z.string().optional(),
  favoriteMovie: z.string().optional(),
  interests: z.string().optional(),
  languages: z.string().optional(),
  ending: z.string().optional(),
});

interface IDeleteProfileModalProp {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteProfileModal = ({ isOpen, onClose, onDelete }: IDeleteProfileModalProp) => {
  return (
    <ConfirmModal isOpen={isOpen} onClose={onClose} onConfirm={onDelete}>
      <div>
        <h2 className="text-xl mb-2">Jesi li siguran_na da želiš obrisati svoj profil?</h2>
        <p className="text-sm">
          Brisanje profila briše sve tvoje fotografije, komentare, lajkove i poruke.
        </p>
      </div>
    </ConfirmModal>
  );
};

const EditMyProfilePage = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userId] = useLocalStorage('userId');
  const { user: currentUser } = useGetUserById(userId as string);
  const { updateUserMutation } = useUpdateUser(userId as string);
  const { deleteUserMutation } = useDeleteUser(userId as string);
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
        age: String(currentUser.data.age) || '',
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
      updateUserMutation(data);
    }
  };

  return (
    <AppLayout>
      <DeleteProfileModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={() => {
          setIsDeleteModalOpen(false);
          if (userId) {
            deleteUserMutation();
          }
        }}
      />
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
                  <Input
                    type="text"
                    className="mb-2"
                    placeholder="Korisničko ime"
                    {...register('username')}
                  />
                  <Input
                    type="text"
                    className="mb-2"
                    placeholder="Lokacija"
                    {...register('location')}
                  />
                  <Input type="text" className="mb-2" placeholder="Rod" {...register('gender')} />
                  <Input
                    type="text"
                    className="mb-2"
                    placeholder="Seksualnost"
                    {...register('sexuality')}
                  />
                  <Input type="text" className="mb-2" placeholder="Godine" {...register('age')} />
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
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
                    type="text"
                    className="mb-2"
                    placeholder="Najdraža youtube pjesma (https://www.youtube.com/embed/)"
                    {...register('favoriteSong')}
                  />
                  <Input
                    type="text"
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
                    type="text"
                    className="mb-2"
                    placeholder="Interesi (odvojeni zarezom)"
                    {...register('interests')}
                  />
                  <Input
                    type="text"
                    className="mb-2"
                    placeholder="Jezici koje govorim (odvojeni zarezom)"
                    {...register('languages')}
                  />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3 mt-3">
              <div className="col-span-2">
                <Button type="danger" className="w-full" onClick={() => setIsDeleteModalOpen(true)}>
                  Obriši svoj profil
                </Button>
              </div>
            </div>
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
