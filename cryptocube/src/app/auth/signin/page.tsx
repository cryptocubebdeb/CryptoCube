import { SignInForm } from "./SignInForm";

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const urlError = params?.error as string | undefined;

  return <SignInForm urlError={urlError} />;
}
