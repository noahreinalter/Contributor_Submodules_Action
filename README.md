# Contributor Submodules Action

A GitHub Action that automates adding submodules

```yaml
  - name: Contributor_Submodules_Action
    uses: noahreinalter/Contributor_Submodules_Action@latest
      with:
        # The url of the submodule
        url: 'url'
        # default: '^\d*$' Regex for the folders to link
        regex: '^\d*$'
        # default: 'false' If 'true' adds links for submodules if they are missing
        relink_submodules: 'false'
        # default: 'false' If 'true' fetch and update all submodules
        update_submodules: 'false'
        # default: 'submodules' Path to the folder where the submodules are saved to
        submodule_save_location: 'submodules'
```
