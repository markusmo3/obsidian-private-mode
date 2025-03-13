# Releasing
You can simplify the version bump process by running npm version patch, npm version minor or npm version major after updating minAppVersion manually in manifest.json. The command will bump version in manifest.json and package.json, and add the entry for the new version to versions.json

There is an automatic GitHub release workflow in place that gets triggered on a push of a tag.
To push a tag:

```bash
git tag 1.0.1
git push origin 1.0.1
```
