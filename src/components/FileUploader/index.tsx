interface IFileUploaderProps {
  Icon?: React.ComponentType<React.ComponentProps<'svg'>>;
}

const FileUploader = ({ Icon }: IFileUploaderProps) => {
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
      <input id="file-upload" type="file" className={Icon ? 'hidden' : ''} multiple />
    </div>
  );
};

export default FileUploader;
