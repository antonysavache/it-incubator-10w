import {ErrorMessage} from "./common.model";

export interface ValidationResult {
    isValid: boolean;
    errors: ErrorMessage[];
}