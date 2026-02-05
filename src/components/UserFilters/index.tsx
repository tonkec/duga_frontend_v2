import Input from '@app/components/Input';
import { BiSearch } from 'react-icons/bi';
import Select from 'react-select';
import { IUser } from '@app/components/UserCard';
import { SyntheticEvent } from 'react';

const selectOptions: { value: keyof IUser; label: string }[] = [
  { value: 'gender', label: 'Rod' },
  { value: 'sexuality', label: 'Seksualnost' },
  { value: 'location', label: 'Lokacija' },
  { value: 'username', label: 'Ime' },
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
      return 'Odaberite kriterij';
  }
};

const UserFilters = ({ selectValue, setSelectValue, search, setSearch }: IUserFiltersProps) => {
  return (
    <div className="lg:flex gap-2 justify-between">
      <div className="lg:flex gap-2">
        <div className="lg:mb-0 flex-1">
          <Input
            type="text"
            placeholder={getPlaceholder(selectValue)}
            icon={<BiSearch color="grey" fontSize="20px" className="mt-[1.5px]" />}
            value={search}
            onChange={(e: SyntheticEvent) => setSearch((e.target as HTMLInputElement).value)}
            className="min-w-[1000px] py-[6px]"
            disabled={!selectValue.value}
          />
        </div>
        <div className="min-w-[200px] flex-1">
          <Select
            options={selectOptions}
            placeholder="Odaberite kriterij"
            onChange={(e) => {
              setSelectValue({
                value: e?.value || '',
                label: e?.label || '',
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default UserFilters;
