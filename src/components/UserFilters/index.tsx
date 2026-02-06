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
      return 'Odaberite kriterij pretrage...';
  }
};

const UserFilters = ({ selectValue, setSelectValue, search, setSearch }: IUserFiltersProps) => {
  return (
    <div className="sm:flex gap-2 justify-between">
      <div className="w-full">
        <Input
          type="text"
          placeholder={getPlaceholder(selectValue)}
          icon={<BiSearch color="grey" fontSize="20px" className="mt-[1.5px]" />}
          value={search}
          onChange={(e: SyntheticEvent) => setSearch((e.target as HTMLInputElement).value)}
          className="w-full py-[6px] xl:min-w-[900px]"
          disabled={!selectValue.value}
        />
      </div>
      <div className="w-full max-w-[200px]">
        <Select
          options={selectOptions}
          isClearable
          placeholder="Odaberite kriterij"
          value={selectValue.value ? selectValue : null}
          onChange={(e) => {
            if (!e) {
              setSelectValue({
                value: '',
                label: '',
              });
              setSearch('');
              return;
            }
            setSelectValue({
              value: e.value,
              label: e.label,
            });
          }}
        />
      </div>
    </div>
  );
};

export default UserFilters;
