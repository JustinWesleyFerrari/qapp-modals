import React, { useMemo, useState } from "react";
import {
  Box,
  ButtonBase,
  Card,
  CircularProgress,
  MenuItem,
  Select,
  styled,
  Typography,
} from "@mui/material";
import { DisplayCode } from "../components/DisplayCode";
import { DisplayCodeResponse } from "../components/DisplayCodeResponse";

import beautify from "js-beautify";
import Button from "../components/Button";
import { OptionsManager } from "../components/OptionsManager";
import {
  FieldExplanation,
  GeneralExplanation,
} from "../components/QRComponents";
import { Spacer } from "../components/Spacer";
import { Code, CustomInput } from "../components/Common-styles";
import { useDropzone } from "react-dropzone";

export const Label = styled("label")(
  ({ theme }) => `
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 14px;
    display: block;
    margin-bottom: 4px;
    font-weight: 400;
    `
);

export const formatResponse = (code) => {
  return beautify.js(code, {
    indent_size: 2, // Number of spaces for indentation
    space_in_empty_paren: true, // Add spaces inside parentheses
  });
};
export const ENCRYPT_QORTAL_GROUP_DATA = ({ myAddress }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(false);

  const [requestData, setRequestData] = useState({
    file: null,
    base64: "",
    isAdmins: false,
    groupId: "",
  });
  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const fileSelected = acceptedFiles[0];
      if (fileSelected) {
        setFile(fileSelected);
      }
    },
  });
  const [dataType, setDataType] = useState("file");
  const [responseData, setResponseData] = useState(formatResponse(``));

  const codePollName = useMemo(() => {
    if (dataType === "file") {
      return `
        await qortalRequestWithTimeout({
          action: "ENCRYPT_QORTAL_GROUP_DATA",
          file: ${file ? "FILE OBJECT" : "empty"},
          isAdmins: ${requestData.isAdmins},
          groupId: ${requestData.groupId}
        }, 120000);
        `.trim();
    } else {
      return `
          await qortalRequestWithTimeout({
            action: "ENCRYPT_QORTAL_GROUP_DATA",
            base64: ${requestData?.base64},
            isAdmins: ${requestData.isAdmins},
            groupId: ${requestData.groupId}
          }, 120000);
          `.trim();
    }
  }, [requestData, dataType]);

  const tsInterface = useMemo(() => {
    if (dataType === "file") {
      return `
interface EncryptQortalGroupDataRequest {
  action: string;
  file: File;
  isAdmins: boolean;
  groupId: number;
}
`.trim();
    } else {
      return `
        interface EncryptQortalGroupDataRequest {
          action: string;
          base64: string;
          isAdmins: boolean;
          groupId: number;
        }
        `.trim();
    }
  }, [requestData, dataType]);

  const executeQortalRequest = async () => {
    try {
      setIsLoading(true);
      const dynamicFields = {};
      if (dataType === "file") {
        dynamicFields["file"] = file;
      } else {
        dynamicFields["base64"] = requestData?.base64;
      }
      let account = await qortalRequestWithTimeout({
        action: "ENCRYPT_QORTAL_GROUP_DATA",
        isAdmins: requestData?.isAdmins,
        groupId: requestData?.groupId,
        ...dynamicFields,
      }, 120000);

      setResponseData(formatResponse(JSON.stringify(account)));
    } catch (error) {
      setResponseData(formatResponse(JSON.stringify(error)));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleChange = (e) => {
    setRequestData((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };
  return (
    <div
      style={{
        padding: "10px",
      }}
    >
      <GeneralExplanation>
        <Typography variant="body1">
          Encrypts data provided by the user that can only be decrypted by the
          members of the group.
        </Typography>
        <Typography variant="body1">
          If you plan on publishing the returned encrypted data, it needs to be
          published to a SERVICE that does not have _PRIVATE
        </Typography>
         <Typography variant="body1">
                This call may take some time if the user has never downloaded the group keys before. In this example we have used the qortalRequestWithTimeout in order to put a custom timeout in miliseconds. The default timeout provided by the regular qortalRequest may not be enough. 

                </Typography>
      </GeneralExplanation>

      <Spacer height="20px" />
      <Card>
        <Typography variant="h5">Modes</Typography>
        <Spacer height="10px" />
        <Box
          sx={{
            padding: "10px",
            outline: "1px solid var(--color3)",
            borderRadius: "5px",
          }}
        >
          <Typography variant="h6">Data type</Typography>
          <Spacer height="10px" />
          <Select
            size="small"
            labelId="label-select-category"
            id="id-select-category"
            value={dataType}
            displayEmpty
            onChange={(e) => setDataType(e.target.value)}
            sx={{
              width: "300px",
            }}
          >
            <MenuItem value={"file"}>file</MenuItem>

            <MenuItem value={"base64"}>base64</MenuItem>
          </Select>
          <Spacer height="5px" />
          <Typography>
            Mode file let's you pass in a FILE object to encrypt.
          </Typography>
          <Spacer height="5px" />
          <Typography>
            Mode base64 let's you pass in a base64 string to encrypt.
          </Typography>
        </Box>
      </Card>
      <Spacer height="20px" />
      <Card>
        <Typography variant="h5">Fields</Typography>
        <Spacer height="5px" />
        <div className="message-row">
          {dataType === "file" && (
            <Box
              sx={{
                padding: "10px",
                outline: "1px solid var(--color3)",
                borderRadius: "5px",
              }}
            >
              <Typography variant="h6">file</Typography>
              <Spacer height="10px" />
              <button
                {...getRootProps()}
                style={{
                  width: "150px",
                }}
              >
                <input {...getInputProps()} />
                Select file
              </button>
              {file && (
                <ButtonBase
                  sx={{
                    width: "150px",
                  }}
                  onClick={() => {
                    setFile(null);
                  }}
                >
                  Remove file
                </ButtonBase>
              )}
              <Spacer height="5px" />
              <Typography>
                {file ? `Selected file: ${file?.name}` : ""}
              </Typography>
              <Spacer height="10px" />
              <FieldExplanation>
                <Typography>Required field</Typography>
              </FieldExplanation>
              <Spacer height="5px" />
              <Typography>Upload a file to be encrypted</Typography>
              <Spacer height="5px" />
            </Box>
          )}
          {dataType === "base64" && (
            <Box
              sx={{
                padding: "10px",
                outline: "1px solid var(--color3)",
                borderRadius: "5px",
              }}
            >
              <Typography variant="h6">base64</Typography>
              <CustomInput
                type="text"
                placeholder="base64"
                value={requestData.base64}
                name="base64"
                onChange={handleChange}
              />
              <Spacer height="10px" />
              <FieldExplanation>
                <Typography>Required field</Typography>
              </FieldExplanation>
              <Spacer height="5px" />
              <Typography>Enter base64 data to be encrypted.</Typography>
            </Box>
          )}
          <Spacer height="5px" />

          <Box
            sx={{
              padding: "10px",
              outline: "1px solid var(--color3)",
              borderRadius: "5px",
            }}
          >
            <Typography variant="h6">isAdmins</Typography>
            <Spacer height="10px" />
            <Select
              size="small"
              labelId="label-select-category"
              id="id-select-category"
              value={requestData?.isAdmins}
              displayEmpty
              onChange={(e) => {
                setRequestData((prev) => {
                  return {
                    ...prev,
                    isAdmins: e.target.value,
                  };
                });
              }}
              sx={{
                width: "300px",
              }}
            >
              <MenuItem value={false}>false</MenuItem>

              <MenuItem value={true}>true</MenuItem>
            </Select>

            <Spacer height="10px" />
            <FieldExplanation>
              <Typography>Optional field</Typography>
            </FieldExplanation>
            <Spacer height="5px" />
            <Typography>
              Mark isAdmins true if you want the group encrypted data to only be
              decrypted by admins of the group. The default is false.
            </Typography>
          </Box>
          <Spacer height="10px" />
          <Box
            sx={{
              padding: "10px",
              outline: "1px solid var(--color3)",
              borderRadius: "5px",
            }}
          >
            <Typography variant="h6">groupId</Typography>
            <CustomInput
              type="text"
              placeholder="groupId"
              value={requestData.groupId}
              name="groupId"
              onChange={handleChange}
            />
            <Spacer height="10px" />
            <FieldExplanation>
              <Typography>Required field</Typography>
            </FieldExplanation>
            <Spacer height="5px" />
            <Typography>Enter the groupId of the Qortal group.</Typography>
          </Box>
          <Spacer height="20px" />
          <Button
            name="Encrypt data"
            bgColor="#309ed1"
            onClick={executeQortalRequest}
          />
        </div>
      </Card>
      <Box
        sx={{
          display: "flex",
          gap: "20px",
        }}
      >
        <Box
          sx={{
            width: "50%",
          }}
        >
          <h3>Request</h3>
          <DisplayCode codeBlock={codePollName} language="javascript" />
          <Spacer height="10px" />
          <h3>TS interface</h3>
          <DisplayCode codeBlock={tsInterface} language="javascript" />
        </Box>
        <Box
          sx={{
            width: "50%",
          }}
        >
          <h3>Response</h3>
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <DisplayCodeResponse
              codeBlock={responseData}
              language="javascript"
            />
          )}
        </Box>
      </Box>
    </div>
  );
};
