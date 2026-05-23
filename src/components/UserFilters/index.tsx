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
    <div className="rounded-2xl border border-[#dce4ff] bg-white p-4 shadow-sm sm:flex gap-3 justify-between">
      <div className="w-full mb-3 sm:mb-0">
        <Input
          type="text"
          placeholder={getPlaceholder(selectValue)}
          icon={<BiSearch color="grey" fontSize="20px" className="mt-[1.5px]" />}
          value={search}
          onChange={(e: SyntheticEvent) => setSearch((e.target as HTMLInputElement).value)}
          className="w-full py-[6px] pl-[40px]"
          disabled={!selectValue.value}
        />
      </div>
      <div className="w-full sm:max-w-[220px]">
        <Select
          options={selectOptions}
          isClearable
          placeholder="Odaberite kriterij"
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary25: '#dce4ff',
              primary: '#2D46B9',
            },
          })}
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
