import React from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { BiChevronRight } from 'react-icons/bi';

interface IBreadcrumbItem {
  path: string;
  title: string;
}

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbItems: IBreadcrumbItem[] = [
    { path: '/', title: 'Početna' },
    ...pathnames.map((name, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      let title = '';

      switch (name) {
        case 'profile':
          title = 'Profil';
          break;
        case 'edit':
          title = 'Uredi profil';
          break;
        case 'new-chat':
          title = 'Nova poruka';
          break;
        case 'chat':
          title = 'Poruke';
          break;
        case 'user':
          title = 'Korisnik';
          break;
        case 'photo':
          title = 'Fotografija';
          break;
        default:
          title = name.charAt(0).toUpperCase() + name.slice(1);
      }

      return { path, title };
    }),
  ];

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-700">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && <BiChevronRight className="text-gray-500" />}
          {index === breadcrumbItems.length - 1 ? (
            <span className="font-medium">{item.title}</span>
          ) : (
            <Link to={item.path} className="hover:text-gray-900 transition-colors duration-200">
              {item.title}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
