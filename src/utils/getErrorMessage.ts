interface IErrorProps {
  path: string;
  message: string;
  code: string;
}

export interface Error {
  response: {
    data: {
      errors: IErrorProps[];
    };
  };
  message: string;
}

const getErrorMessage = (error: Error) => {
  if (error?.response?.data?.errors) {
    return error.response.data.errors
      .map((error: IErrorProps) => error.message)
      .flat()
      .join(' ');
  }

  return error.message;
};

export { getErrorMessage };
