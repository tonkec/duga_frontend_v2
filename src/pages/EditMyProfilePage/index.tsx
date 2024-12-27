import { BiSolidCamera, BiSolidFile } from 'react-icons/bi';
import AppLayout from '../../components/AppLayout';
import Card from '../../components/Card';
import PhotoUploader from '../../components/PhotoUploader';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Input from '../../components/Input';
import Select from 'react-select';
import Checkbox from '../../components/Checkbox';
import TextArea from '../../components/Textarea';
import { useGetUserById } from '../../hooks/useGetUserById';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useUpdateUser } from './hooks';
import { SubmitHandler, useForm } from 'react-hook-form';
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
  { value: 'idk', label: 'Ne znam' },
];

type Inputs = {
  bio: string;
  age: number;
  location: string;
  sexuality: string;
  gender: string;
  username: string;
};
const schema = z.object({
  bio: z.string().min(2),
  age: z.number().int(),
  location: z.string().min(2),
  sexuality: z.string().min(2),
  gender: z.string().min(2),
  username: z.string().min(2),
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
                  <Select
                    isClearable
                    options={lookingForOptions}
                    placeholder="Trenutno tražim..."
                    onChange={(e) => {
                      console.log(e);
                    }}
                    className="mb-2"
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        text: 'orangered',
                        primary25: '#F037A5',
                        primary: 'black',
                      },
                    })}
                  />
                  <Select
                    isClearable
                    options={relationshipStatusOptions}
                    placeholder="Trenutno sam..."
                    onChange={(e) => {
                      console.log(e);
                    }}
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        text: 'orangered',
                        primary25: '#F037A5',
                        primary: 'black',
                      },
                    })}
                    className="mb-2"
                  />
                </div>
              </div>
              <h2 className="mb-2">Stil života</h2>
              <div className="flex grid-cols-1 md:grid-cols-3 gap-5 mb-3">
                <div className="col-span-2">
                  <Checkbox /> Cigarete{' '}
                </div>
                <div className="col-span-2">
                  <Checkbox /> Alkohol
                </div>
                <div className="col-span-2">
                  <Checkbox /> Sport
                </div>
              </div>
              <h2 className="mb-2">Vrijednosti</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
                <div className="col-span-2">
                  <Input className="mb-2" placeholder="Religioznost" />
                  <Input className="mb-2" placeholder="Političnost" />
                </div>
              </div>
              <h2 className="mb-2">Ostalo</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
                <div className="col-span-2">
                  <Input className="mb-2" placeholder="Interesi" />
                  <Input className="mb-2" placeholder="Jezici koje govorim" />
                </div>
              </div>
              <h2 className="mb-2">Fun facts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
                <div className="col-span-2">
                  <TextArea
                    className="mb-4"
                    placeholder="Najsramotnija stvar koja mi se dogodila..."
                  />
                  <TextArea className="mb-4" placeholder="Imam previše godina za...." />
                  <TextArea className="mb-4" placeholder="Dan mi je ljepši ako..." />
                  <Input className="mb-2" placeholder="Najdraža youtube pjesma (youtube link)" />
                  <Input className="mb-2" placeholder="Trailer za najdraži film (youtube link)" />
                  <TextArea placeholder="Za kraj još nešto o meni" />
                  <Button type="primary" className="mt-4">
                    Spremi
                  </Button>
                </div>
              </div>
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
