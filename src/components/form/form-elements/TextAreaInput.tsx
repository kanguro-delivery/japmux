// "use client";
// import React, { useState } from "react";
// import ComponentCard from "../../common/ComponentCard";
// import TextArea from "../input/TextArea";
// import Label from "../Label";

// export default function TextAreaInput() {
//   const [message, setMessage] = useState("");
//   const [messageTwo, setMessageTwo] = useState("");
//   return (
//     <ComponentCard title="Textarea input field">
//       <div className="space-y-6">
//         {/* Default TextArea */}
//         <div>
//           <Label>Description</Label>
//           <TextArea
//             value={message}
//             onChange={(value) => setMessage(value)}
//             rows={6}
//           />
//         </div>

//         {/* Disabled TextArea */}
//         <div>
//           <Label>Description</Label>
//           <TextArea rows={6} disabled />
//         </div>

//         {/* Error TextArea */}
//         <div>
//           <Label>Description</Label>
//           <TextArea
//             rows={6}
//             value={messageTwo}
//             error
//             onChange={(value) => setMessageTwo(value)}
//             hint="Please enter a valid message."
//           />
//         </div>
//       </div>
//     </ComponentCard>
//   );
// }
import React from "react";

interface TextareaInputProps {
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
}

const TextareaInput: React.FC<TextareaInputProps> = ({
  label,
  value,
  onChange,
  required = false,
  readOnly = false,
  disabled = false,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows={6}
        className="w-full px-3 py-2 border rounded-md"
        required={required}
        readOnly={readOnly}
        disabled={disabled}
      />
    </div>
  );
};

export default TextareaInput;
