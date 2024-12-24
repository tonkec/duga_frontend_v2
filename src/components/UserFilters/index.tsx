import Button from '../Button';
import Input from '../Input';
import { BiSearch } from 'react-icons/bi';

const UserFilters = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-3 mt-8">
      <Input placeholder="Pretraži prema imenu" icon={<BiSearch color="grey" fontSize="20px" />} />
      <Input
        placeholder="Pretraži prema lokaciji"
        icon={<BiSearch color="grey" fontSize="20px" />}
      />
      <Input placeholder="Pretraži prema rodu" icon={<BiSearch color="grey" fontSize="20px" />} />
      <Input
        placeholder="Pretraži prema seksualnosti"
        icon={<BiSearch color="grey" fontSize="20px" />}
      />
      <Button onClick={() => {}} type="primary">
        Pretraži
      </Button>
    </div>
  );
};

export default UserFilters;
