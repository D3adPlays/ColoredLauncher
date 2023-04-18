import { userInfo } from "os";
export class launcherFile {
	constructor(
		public Key: string,
		public Size: BigInteger,
		public ETag: string,
		public appData: string = userInfo().homedir +
			"\\AppData\\Roaming\\.ColoredV2\\"
	) {}

	getKey(): string {
		return this.Key;
	}
	getSize(): BigInteger {
		return this.Size;
	}
	getETag(): string {
		return this.ETag;
	}
}
