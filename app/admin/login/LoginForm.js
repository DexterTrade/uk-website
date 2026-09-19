"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "./actions";

const initialState = { error: null };

export default function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="card flex flex-col gap-3.5">
      <input type="hidden" name="next" value={next} />
      <label className="field">
        Email
        <input className="input" type="email" name="email" required autoFocus />
      </label>
      <label className="field">
        Password
        <input className="input" type="password" name="password" required />
      </label>
      <button className="btn btn-navy" type="submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {state?.error && <p className="alert alert-error">{state.error}</p>}
    </form>
  );
}
