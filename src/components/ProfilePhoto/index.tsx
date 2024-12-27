import { Link } from 'react-router';

interface IProfilePhotoProps {
  url: string;
}

const ProfilePhoto = ({ url }: IProfilePhotoProps) => {
  return (
    <Link to={'/profile'}>
      <img src={url} className="rounded-full" height={40} width={40} />
    </Link>
  );
};

export default ProfilePhoto;
