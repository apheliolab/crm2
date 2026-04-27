import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.APHELIO_ADMIN_EMAIL;
const adminPassword = process.env.APHELIO_ADMIN_PASSWORD;

if (!url || !serviceRoleKey || !adminEmail || !adminPassword) {
  console.error("Missing required environment variables for admin bootstrap.");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function findUserByEmail(email) {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) throw error;

    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (data.users.length < 200) return null;

    page += 1;
  }
}

async function main() {
  const existingUser = await findUserByEmail(adminEmail);

  let userId = existingUser?.id;

  if (!existingUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        name: "Aphelio Admin",
      },
    });

    if (error) throw error;
    userId = data.user.id;
    console.log(`Admin created: ${adminEmail}`);
  } else {
    const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        ...(existingUser.user_metadata ?? {}),
        name: "Aphelio Admin",
      },
    });

    if (error) throw error;
    console.log(`Admin updated: ${adminEmail}`);
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    email: adminEmail,
    full_name: "Aphelio Admin",
    role: "admin",
  });

  if (profileError) {
    throw profileError;
  }

  console.log("Admin profile synchronized as role=admin.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
