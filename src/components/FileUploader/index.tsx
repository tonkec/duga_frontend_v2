import { SyntheticEvent } from 'react';

interface IFileUploaderProps {
  Icon?: React.ComponentType<React.ComponentProps<'svg'>>;
  onFileSelect?: (file: File) => void;
}

const FileUploader = ({ Icon, onFileSelect }: IFileUploaderProps) => {
  const handleFileUpload = (event: SyntheticEvent) => {
    const file = (event.target as HTMLFormElement).files[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <div>
      <label htmlFor="file-upload" className="cursor-pointer">
        {Icon && (
          <Icon
            className="cursor-pointer mt-1"
            style={{ transform: 'rotate(90deg)', fontSize: 25 }}
          />
        )}
      </label>
      <input
        id="file-upload"
        type="file"
        className={Icon ? 'hidden' : ''}
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default FileUploader;
