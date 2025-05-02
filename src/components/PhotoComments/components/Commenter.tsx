import { IUser } from '../../UserCard';

const Commenter = ({ isUserLoading, user }: { isUserLoading: boolean; user: IUser }) => {
  return isUserLoading ? <p className="text-xs">Loading user...</p> : <p>od: {user?.username}</p>;
};

export default Commenter;
