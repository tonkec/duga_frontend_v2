import {
  ChangeEvent,
  forwardRef,
  InputHTMLAttributes,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { BiUpload } from 'react-icons/bi';

interface FileUploadInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'type'> {
  containerClassName?: string;
  helperText?: string;
  label?: string;
}

const getSelectedFilesLabel = (files: FileList | null | undefined) => {
  if (!files || files.length === 0) {
    return 'Nijedna datoteka nije odabrana';
  }

  if (files.length === 1) {
    return files[0].name;
  }

  return `${files.length} datoteka odabrano`;
};

const FileUploadInput = forwardRef<HTMLInputElement, FileUploadInputProps>(
  (
    {
      containerClassName = '',
      disabled,
      helperText,
      id,
      label = 'Odaberi datoteku',
      onChange,
      ...inputProps
    },
    forwardedRef
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [selectedFilesLabel, setSelectedFilesLabel] = useState('Nijedna datoteka nije odabrana');

    useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      setSelectedFilesLabel(getSelectedFilesLabel(event.target.files));
      onChange?.(event);
    };

    return (
      <div
        className={`rounded-2xl border border-dashed border-[#b9c6ff] bg-[#f7f9ff] p-3 ${containerClassName}`}
      >
        <input
          {...inputProps}
          id={id}
          ref={inputRef}
          type="file"
          className="hidden"
          disabled={disabled}
          onChange={handleChange}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-blue px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue/15 transition-colors hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <BiUpload size={20} />
            {label}
          </button>
          <span className="min-w-0 truncate text-sm font-medium text-gray-600">
            {selectedFilesLabel}
          </span>
        </div>
        {helperText && <p className="mt-2 text-xs leading-5 text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

FileUploadInput.displayName = 'FileUploadInput';

export default FileUploadInput;
