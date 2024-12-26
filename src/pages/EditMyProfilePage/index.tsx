import { BiSolidCamera, BiSolidFile } from 'react-icons/bi';
import AppLayout from '../../components/AppLayout';
import Card from '../../components/Card';
import PhotoUploader from '../../components/PhotoUploader';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Input from '../../components/Input';
import Select from 'react-select';
import Checkbox from '../../components/Checkbox';

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
  { value: 'idk', label: 'Ne znam' },
  { value: 'inbetween', label: 'Nešto izmedju' },
];

const EditMyProfilePage = () => {
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
            <h2 className="mb-2">Općenito</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3">
              <div className="col-span-2">
                <Input className="mb-2" placeholder="Lokacija" />
                <Input className="mb-2" placeholder="Rod" />
                <Input className="mb-2" placeholder="Seksualnost" />
                <Input className="mb-2" placeholder="Godine" />
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
                TEXTAREAS
                <Input className="mb-2" placeholder="Najsramotnija stvar koja mi se dogodila" />
                <Input className="mb-2" placeholder="Imam previše godina za..." />
                <Input className="mb-2" placeholder="Dan mi je ljepši ako..." />
                <Input className="mb-2" placeholder="Najdraža youtube pjesma" />
                <Input className="mb-2" placeholder="Trailer za najdraži film." />
                <Input className="mb-2" placeholder="Za kraj nešto o meni" />
              </div>
            </div>
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
