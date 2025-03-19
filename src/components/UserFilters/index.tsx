import Input from '../Input';
import { BiSearch } from 'react-icons/bi';
import Select from 'react-select';
import { IUser } from '../UserCard';
import { SyntheticEvent } from 'react';

const selectOptions: { value: keyof IUser; label: string }[] = [
  { value: 'gender', label: 'rod' },
  { value: 'sexuality', label: 'seksualnost' },
  { value: 'location', label: 'lokacija' },
  { value: 'username', label: 'ime' },
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

const getPlaceholder = (selectValue: { value: string; label: string }) => {
  switch (selectValue.value) {
    case 'username':
      return 'Pretraži prema imenu...';
    case 'gender':
      return 'Pretraži prema rodu...';
    case 'sexuality':
      return 'Pretraži prema seksualnosti...';
    case 'location':
      return 'Pretraži prema lokaciji...';
    default:
      return 'Pretraži prema...';
  }
};

const UserFilters = ({ selectValue, setSelectValue, search, setSearch }: IUserFiltersProps) => {
  return (
    <div className="lg:flex gap-2 justify-between mb-4">
      <h2 className="justify-start mb-2 lg:mb-0">
        <span>👇 Neke zanimljive osobice </span>
      </h2>
      <div className="lg:flex gap-2">
        <div className="mb-2 lg:mb-0">
          <Input
            type="text"
            placeholder={getPlaceholder(selectValue)}
            icon={<BiSearch color="grey" fontSize="20px" className="mt-1" />}
            value={search}
            onChange={(e: SyntheticEvent) => setSearch((e.target as HTMLInputElement).value)}
            className="md:min-w-[600px] py-[6px]"
          />
        </div>
        <div className="min-w-[200px]">
          <Select
            isClearable={false}
            options={selectOptions}
            placeholder="Pretraži prema..."
            onChange={(e) => {
              setSelectValue({
                value: e?.value || '',
                label: e?.label || '',
              });
            }}
            defaultValue={selectOptions.find((option) => option.value === selectValue.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default UserFilters;
