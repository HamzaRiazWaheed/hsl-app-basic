import { Icon, Input } from "@chakra-ui/react";
import useDebounce from "../../hooks/useDebounce";
import React, { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { InputGroup } from "./input-group";

const ClearableInput = ({
  term,
  onChange,
  debounceTime = 0,
  placeholder = "",
}: {
  term: string;
  onChange: (value: string) => void;
  debounceTime: number;
  placeholder?: string;
}) => {
  const [keyword, setKeyword] = useState(term);
  const debouncedKeyword = useDebounce(keyword, debounceTime);
  useEffect(() => {
    onChange(debouncedKeyword);
  }, [debouncedKeyword, onChange]);
  return (
    <InputGroup
      endOffset={10}
      endElement={
        keyword.length > 0 ? (
          <Icon
            color="white"
            size="md"
            width={30}
            onClick={() => setKeyword("")}
          >
            <RxCross2 />
          </Icon>
        ) : null
      }
    >
      <Input
        type="text"
        paddingStart={"5px"}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder={placeholder}
        borderRadius={6}
      />
    </InputGroup>
  );
};

export default ClearableInput;
