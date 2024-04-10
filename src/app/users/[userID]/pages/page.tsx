"use client";

export default function Page({ params }: { params: { userID: string } }) {
  return <div>{params.userID}</div>;
}
