import { BiSolidCamera, BiSolidFile } from 'react-icons/bi';
import AppLayout from '../../components/AppLayout';
import Card from '../../components/Card';
import PhotoUploader from '../../components/PhotoUploader';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

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
          <Card>Biografija</Card>
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
