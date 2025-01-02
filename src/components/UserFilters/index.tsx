import Input from '../Input';
import { BiSearch } from 'react-icons/bi';
import Select from 'react-select';
import { IUser } from '../UserCard';
import { SyntheticEvent } from 'react';

const selectOptions: { value: keyof IUser; label: string }[] = [
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
    <div className="flex gap-2 justify-end mb-4">
      <div>
        <Input
          type="text"
          placeholder={`Pretraži ${selectValue.label}`}
          icon={<BiSearch color="grey" fontSize="20px" />}
          value={search}
          onChange={(e: SyntheticEvent) => setSearch((e.target as HTMLInputElement).value)}
        />
      </div>
      <div>
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
      </div>
    </div>
  );
};

export default UserFilters;
