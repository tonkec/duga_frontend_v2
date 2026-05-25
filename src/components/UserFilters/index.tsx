import Input from '@app/components/Input';
import { BiSearch } from 'react-icons/bi';
import { IUser } from '@app/components/UserCard';
import { SyntheticEvent } from 'react';

const selectOptions: { value: keyof IUser; label: string }[] = [
  { value: 'username', label: 'Ime' },
  { value: 'gender', label: 'Rod' },
  { value: 'sexuality', label: 'Seksualnost' },
  { value: 'location', label: 'Lokacija' },
];

const defaultSelectValue = { value: 'username', label: 'Ime' };

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
      return 'Pretraži prema imenu...';
  }
};

const UserFilters = ({ selectValue, setSelectValue, search, setSearch }: IUserFiltersProps) => {
  const hasActiveFilters =
    search.trim().length > 0 || selectValue.value !== defaultSelectValue.value;

  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-[#dce4ff] bg-gradient-to-br from-white via-[#fbfcff] to-[#f7f9ff] p-4 shadow-sm">
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue/10 blur-3xl" />

      <div className="relative z-10 mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue">Pretraga</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-950">Pronađi korisnike</h1>
        <p className="mt-1 text-sm text-gray-600">
          Odaberi kriterij pa upiši pojam koji želiš pretražiti.
        </p>
      </div>

      <div className="relative z-10 grid gap-3">
        <Input
          type="text"
          placeholder={getPlaceholder(selectValue)}
          icon={<BiSearch color="#6b7280" fontSize="20px" className="mt-[1.5px]" />}
          value={search}
          onChange={(e: SyntheticEvent) => setSearch((e.target as HTMLInputElement).value)}
          className="h-12 w-full rounded-2xl border-[#dce4ff] bg-white pl-11 text-sm shadow-sm disabled:bg-gray-50"
        />

        <div className="flex flex-wrap gap-2" role="group" aria-label="Kriterij pretrage">
          {selectOptions.map((option) => {
            const isSelected = selectValue.value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  isSelected
                    ? 'border-blue bg-blue text-white shadow-sm shadow-blue/20'
                    : 'border-[#dce4ff] bg-white text-gray-700 hover:bg-[#f0f4ff] hover:text-blue-dark'
                }`}
                aria-pressed={isSelected}
                onClick={() => {
                  setSelectValue({
                    value: option.value,
                    label: option.label,
                  });
                  setSearch('');
                }}
              >
                {option.label}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              type="button"
              className="rounded-xl border border-red/30 bg-red/10 px-4 py-2 text-sm font-semibold text-red shadow-sm transition-colors hover:bg-red hover:text-white"
              onClick={() => {
                setSelectValue(defaultSelectValue);
                setSearch('');
              }}
            >
              Očisti
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default UserFilters;
