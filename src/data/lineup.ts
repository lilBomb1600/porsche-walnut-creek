import { dealership } from "./dealership";

const O = dealership.official;

// Model lines and body styles exactly as the official site's inventory menu lists them.
export const lineup = [
  {
    id: "911",
    name: "911",
    styles: ["911"],
    newUrl: `${O}/new-vehicles/911-2/`,
    usedUrl: `${O}/used-vehicles/911-2/`,
  },
  {
    id: "718",
    name: "718",
    styles: ["Boxster", "Cayman", "Spyder"],
    newUrl: `${O}/new-vehicles/718-cayman/`,
    usedUrl: `${O}/used-vehicles/cayman/`,
  },
  {
    id: "taycan",
    name: "Taycan",
    styles: ["All-electric"],
    newUrl: `${O}/new-vehicles/taycan/`,
    usedUrl: `${O}/used-vehicles/taycan/`,
  },
  {
    id: "panamera",
    name: "Panamera",
    styles: ["Panamera"],
    newUrl: `${O}/new-vehicles/panamera/`,
    usedUrl: `${O}/used-vehicles/panamera/`,
  },
  {
    id: "macan",
    name: "Macan",
    styles: ["Macan", "All-electric Macan"],
    newUrl: `${O}/new-vehicles/macan/`,
    usedUrl: `${O}/used-vehicles/macan/`,
  },
  {
    id: "cayenne",
    name: "Cayenne",
    styles: ["Cayenne", "Cayenne Coupe"],
    newUrl: `${O}/new-vehicles/new-cayenne/`,
    usedUrl: `${O}/used-vehicles/cayenne/`,
  },
] as const;
