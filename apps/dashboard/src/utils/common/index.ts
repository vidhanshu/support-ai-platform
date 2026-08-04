export const getInitials = (name: string) => {
  const splitted = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0]);
  return splitted.join("").toUpperCase();
};
