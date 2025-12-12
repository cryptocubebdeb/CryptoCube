import SignUpForm from "./SignUpForm";

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const urlError = params?.error as string | undefined;

  return <SignUpForm urlError={urlError} />;
}
