import { UNSAFE_Combobox } from "@navikt/ds-react";

export const TagFilter = ({initialOptions} : {initialOptions : string[]}) : JSX.Element => {
  return (
    <div>
      <UNSAFE_Combobox
        label="Filter?"
        options={initialOptions}
        isMultiSelect
      />
    </div>
  );
};

// const initialOptions = [
//   "car",
//   "bus",
//   "train",
//   "skateboard",
//   "bicycle",
//   "motorcycle",
//   "boat",
//   "airplane",
//   "helicopter",
//   "truck",
//   "van",
//   "scooter",
// ];
