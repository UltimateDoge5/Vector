import { currentUser } from "@clerk/nextjs";

export default async function HomePage() {
  const user = await currentUser();

  console.log(`Email: ${user?.emailAddresses[0]?.emailAddress}, role: ${user?.privateMetadata?.role}`);

  return (
    <div>
      Mamy to
    </div>
  );
}
