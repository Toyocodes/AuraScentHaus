import type { AddressDTO, AddressInput, UpdateAddressInput } from "@aurascenthaus/shared";
import type { DataResponse } from "../helper/types";

export type { AddressDTO, AddressInput, UpdateAddressInput };

export interface UpdateAddressVariables {
  addressId: string;
  input: UpdateAddressInput;
}

export type AddressListResponse = DataResponse<AddressDTO[]>;
export type AddressResponse = DataResponse<AddressDTO>;
