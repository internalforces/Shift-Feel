# Third-Party Notices

## FMOD Engine and FMOD Studio

Shift Feel contains source code for an optional bridge to FMOD Engine and FMOD Studio. The FMOD SDK, runtime libraries, sample banks, and sample media are not included in this repository and are not covered by the MIT License.

Anyone using the optional FMOD integration must obtain FMOD directly from Firelight Technologies and comply with the current [FMOD legal terms](https://www.fmod.com/legal). In particular:

- Do not commit or redistribute FMOD SDK files through this repository.
- Do not redistribute FMOD example media or example bank files.
- Add the required FMOD attribution to any distributed product that includes FMOD.
- Confirm that your intended commercial or non-commercial use is permitted before distribution.

The local setup guide is [docs/fmod-setup.md](docs/fmod-setup.md). This notice is informational and does not replace the FMOD license terms.

## Open-source dependency inventory

[`sbom.cdx.json`](sbom.cdx.json) is a CycloneDX software bill of materials generated from the locked npm dependency tree. Regenerate it after dependency updates with:

```sh
npm run sbom
```

The SBOM records package identities, versions, and declared licenses. It complements, but does not replace, the license texts and notices that may be required in a distributed application. Before a store release, also generate and include the applicable CocoaPods and native dependency acknowledgements.
