import { Link } from 'react-router';

interface IProfilePhotoProps {
  url: string;
}

const ProfilePhoto = ({ url }: IProfilePhotoProps) => {
  return (
    <Link to={'/profile'}>
      <img src={url} className="rounded-full" height={60} width={60} />
    </Link>
  );
};

export default ProfilePhoto;
