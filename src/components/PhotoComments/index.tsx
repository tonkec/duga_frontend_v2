import Button from '../Button';
import Input from '../Input';

const PhotoComments = () => {
  return (
    <div className="flex flex-col gap-2 ">
      <form>
        <Input type="text" placeholder="Unesite komentar" />
        <Button type="primary" className="mt-2 ">
          Komentiraj
        </Button>
      </form>
    </div>
  );
};

export default PhotoComments;
