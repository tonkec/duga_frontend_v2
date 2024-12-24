import Input from '../Input';
import { BiSearch } from 'react-icons/bi';
import Select from 'react-select';
import { User } from '../UserCard';
import { SyntheticEvent } from 'react';

const selectOptions: { value: keyof User; label: string }[] = [
  { value: 'gender', label: 'rod' },
  { value: 'sexuality', label: 'seksualnost' },
  { value: 'location', label: 'lokacija' },
  { value: 'firstName', label: 'ime' },
];

interface IUserFiltersProps {
  selectValue: {
    value: string;
    label: string;
  };
  setSelectValue: (value: { value: string; label: string }) => void;
  search: string;
  setSearch: (value: string) => void;
}

const UserFilters = ({ selectValue, setSelectValue, search, setSearch }: IUserFiltersProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 mt-8">
      <Select
        isClearable
        options={selectOptions}
        placeholder="Pretraži prema..."
        onChange={(e) => {
          setSelectValue({
            value: e?.value || '',
            label: e?.label || '',
          });
        }}
      />
      <Input
        placeholder={`Pretraži ${selectValue.label}`}
        icon={<BiSearch color="grey" fontSize="20px" />}
        value={search}
        onChange={(e: SyntheticEvent) => setSearch((e.target as HTMLInputElement).value)}
      />
    </div>
  );
};

export default UserFilters;
