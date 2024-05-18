import { ArrowLeftIcon, BookIcon, SignInIcon } from '@primer/octicons-react';

import { type FC, useCallback, useContext, useState } from 'react';
import { Form, type FormRenderProps } from 'react-final-form';
import { useNavigate } from 'react-router-dom';

import { FieldInput } from '../components/fields/FieldInput';
import { AppContext } from '../context/App';
import type { AuthTokenOptions } from '../types';
import { openExternalLink } from '../utils/comms';
import { Constants } from '../utils/constants';

import { getNewTokenURL } from '../utils/auth';

const GITHUB_DOCS_URL =
  'https://docs.github.com/en/enterprise-server@3.13/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens';

interface IValues {
  token?: string;
  hostname?: string;
}

interface IFormErrors {
  token?: string;
  hostname?: string;
}

export const validate = (values: IValues): IFormErrors => {
  const errors: IFormErrors = {};
  if (!values.token) {
    errors.token = 'Required';
  } else if (!/^[A-Z0-9_]{40}$/i.test(values.token)) {
    errors.token = 'Invalid token.';
  }

  if (!values.hostname) {
    errors.hostname = 'Required';
  } else if (
    !/^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/i.test(
      values.hostname,
    )
  ) {
    errors.hostname = 'Invalid hostname.';
  }

  return errors;
};

export const LoginWithToken: FC = () => {
  const { validateToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [isValidToken, setIsValidToken] = useState<boolean>(true);

  const openLink = useCallback((url: string) => {
    openExternalLink(url);
  }, []);

  const renderForm = (formProps: FormRenderProps) => {
    const { handleSubmit, submitting, pristine, values } = formProps;

    const buttonClasses =
      'rounded bg-gray-300 font-semibold rounded text-sm text-center hover:bg-gray-500 hover:text-white dark:text-black focus:outline-none cursor-pointer';

    return (
      <form onSubmit={handleSubmit}>
        <FieldInput
          name="token"
          label="Token"
          placeholder="The 40 characters token generated on GitHub"
          helpText={
            <div>
              <div>
                <button
                  type="button"
                  className={`px-2 py-1 text-xs ${buttonClasses}`}
                  disabled={!values.hostname}
                  onClick={() => openLink(getNewTokenURL(values.hostname))}
                >
                  Generate a PAT
                </button>{' '}
                on GitHub and paste above.
              </div>
              <div className="italic mt-1">
                The required scopes will be selected for you.
              </div>
            </div>
          }
        />

        <FieldInput
          name="hostname"
          label="Hostname"
          placeholder="github.company.com"
          helpText={
            <div>
              <div>Defaults to github.com.</div>
              <div className="italic mt-1">
                Change only if you are using GitHub Enterprise Server.
              </div>
            </div>
          }
        />

        {!isValidToken && (
          <div className="mt-4 text-red-500 text-sm font-medium">
            This token could not be validated with {values.hostname}.
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-xs italic hover:text-blue-500 justify-center items-center">
            <button
              type="button"
              aria-label="GitHub Docs"
              className={`px-2 py-1 text-xs ${buttonClasses}`}
              onClick={() => openLink(GITHUB_DOCS_URL)}
            >
              <BookIcon size={12} /> Docs
            </button>
          </div>
          <div className="justify-center items-center">
            <button
              className={`float-right px-4 py-2 my-4 ${buttonClasses}`}
              title="Login"
              disabled={submitting || pristine}
              type="submit"
            >
              <SignInIcon size={14} /> Login
            </button>
          </div>
        </div>
      </form>
    );
  };

  const submit = useCallback(async (data: IValues) => {
    setIsValidToken(true);
    try {
      await validateToken(data as AuthTokenOptions);
      navigate(-1);
    } catch (err) {
      setIsValidToken(false);
    }
  }, []);

  return (
    <div className="flex-1 bg-white dark:bg-gray-dark dark:text-white">
      <div className="flex justify-between items-center mt-4 py-2 mx-8">
        <button
          type="button"
          className="focus:outline-none"
          title="Go Back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon
            size={20}
            className="hover:text-gray-400"
            aria-label="Go Back"
          />
        </button>

        <h3 className="text-lg font-semibold">
          Login with Personal Access Token
        </h3>
      </div>

      <div className="flex-1 px-8">
        <Form
          initialValues={{
            token: '',
            hostname: Constants.DEFAULT_AUTH_OPTIONS.hostname,
          }}
          onSubmit={submit}
          validate={validate}
        >
          {renderForm}
        </Form>
      </div>
    </div>
  );
};
