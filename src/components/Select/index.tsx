import { Controller } from 'react-hook-form';
import Select from 'react-select';

interface IAppSelectProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  options: { value: string; label: string }[];
  placeholder: string;
  className?: string;
  name: string;
}

const AppSelect = ({ control, name, options, placeholder, className }: IAppSelectProps) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          isClearable
          options={options}
          placeholder={placeholder}
          className={className}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary25: '#F037A5',
              primary: 'black',
            },
          })}
          onChange={(selectedOption: { label: string; value: string } | null) =>
            field.onChange(selectedOption ? selectedOption.value : null)
          }
        />
      )}
    />
  );
};

export default AppSelect;
