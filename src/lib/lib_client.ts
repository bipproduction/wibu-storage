import {dirCreate} from "./client/dir_create";
import {dirDelete} from "./client/dir_delete";
import {dirRename} from "./client/dir_rename";
import {fileDelete} from "./client/file_delete";
import {fileRename} from "./client/file_rename";
import {fileUpload} from "./client/file_upload";
    export const libClient = {dirCreate, dirDelete, dirRename, fileDelete, fileRename, fileUpload};