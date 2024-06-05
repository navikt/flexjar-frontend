import { UNSAFE_Combobox } from "@navikt/ds-react";

interface TagFilterProps {
  initialOptions: string[];
  selectedTags: string[];
  setSelectedTags: (newTags: string[]) => void;
}

export const TagFilter = ({ initialOptions, selectedTags, setSelectedTags }: TagFilterProps): JSX.Element => {
  return (
    <div>
      <UNSAFE_Combobox
        label="Filter?"
        options={initialOptions}
        isMultiSelect
        onToggleSelected={(option, isSelected) => {
          if (option && isSelected) {
            setSelectedTags([...selectedTags, option]);
          } else {
            setSelectedTags(selectedTags.filter(x => x !== option));
          }
        }}
      />
    </div>
  );
};

// Example usage:
// const allTags = ["car", "bus", "train", "skateboard", "bicycle"];
// <TagFilter initialOptions={Array.from(allTags || [])} setSelectedTags={setSelectedTags}/>
