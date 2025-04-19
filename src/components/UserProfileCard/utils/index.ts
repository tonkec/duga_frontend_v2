import { truncateString } from '@app/utils/truncateString';

export const getLookingForTranslation = (lookingFor: string) => {
  switch (lookingFor) {
    case 'friendship':
      return 'Prijateljstvo';
    case 'date':
      return 'Dejt';
    case 'relationship':
      return 'Vezu';
    case 'marriage':
      return 'Brak';
    case 'partnership':
      return 'Partnerstvo';
    case 'nothing':
      return 'Samo zujim';
    case 'idk':
      return 'Ne znam';
    default:
      return 'N/A';
  }
};

export const getRelationshipStatusTranslation = (relationshipStatus: string) => {
  switch (relationshipStatus) {
    case 'single':
      return 'Single';
    case 'relationship':
      return 'U vezi';
    case 'marriage':
      return 'U braku';
    case 'partnership':
      return 'U partnerstvu';
    case 'inbetween':
      return 'Nešto izmedju';
    case 'divorced':
      return 'Razveden/a';
    case 'widowed':
      return 'Udovac/udovica';
    case 'separated':
      return 'Razdvojen/a';
    case 'open':
      return 'U otvorenoj vezi';
    case 'engaged':
      return 'Zaručen/a';
    case 'idk':
      return 'Ne znam';
    default:
      return 'N/A';
  }
};

export const getFavoriteDayOfWeekTranslation = (favoriteDayOfWeek: string) => {
  switch (favoriteDayOfWeek) {
    case 'monday':
      return 'Ponedjeljak';
    case 'tuesday':
      return 'Utorak';
    case 'wednesday':
      return 'Srijeda';
    case 'thursday':
      return 'Četvrtak';
    case 'friday':
      return 'Petak';
    case 'saturday':
      return 'Subota';
    case 'sunday':
      return 'Nedjelja';
    default:
      return 'N/A';
  }
};

export const shouldRenderField = (field: string) => {
  return field && field !== 'N/A';
};

export const getUserBio = (bio: string) => {
  if (!bio) {
    return 'Biografija još nije postavljena.';
  }

  return truncateString(bio, 100);
};
