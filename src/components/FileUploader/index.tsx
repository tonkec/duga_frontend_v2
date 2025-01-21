import { SyntheticEvent } from 'react';

interface IFileUploaderProps {
  Icon?: React.ComponentType<React.ComponentProps<'svg'>>;
  onFileSelect?: (file: SyntheticEvent) => void;
}

const FileUploader = ({ Icon, onFileSelect }: IFileUploaderProps) => {
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
        onChange={onFileSelect}
        multiple
      />
    </div>
  );
};

export default FileUploader;
