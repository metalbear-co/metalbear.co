# mirrord Contributing Guide
Welcome! We are glad that you want to contribute to mirrord! 💖
Before submitting pull request features, please discuss them with us first by [opening an issue](https://github.com/metalbear-co/mirrord.dev/issues) or a discussion.  Feel free to join our [Discord channel](https://discord.com/invite/metalbear) for help and guidance.

## Who can contribute?
Anyone can contribute to this project. We welcome new/junior/starting developers.
There are several ways in which you can contribute:
- Bug fixes
- Issues Review
- Web design
- New software features
- Documentation and Knowledge Base articles
- Answering questions on discord

## Before You Get Started
### Code of Conduct
In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to make participation in our project and our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

To contribute to this project, please follow our [Code of Conduct](https://github.com/metalbear-co/mirrord/blob/main/CODE_OF_CONDUCT.md).

## How to Contribute
The following guide details the steps to achieve a PR in this repository successfully.
### Prerequisite 
If you are running this locally, make sure you have the following prerequisites installed on your operating system before you start contributing:
- Install dependencies:
  ```
  yarn install
  ```
  or

  ```
  npm install
  ```

- Create an index for search
  ```
  npm run build
  ```
  or
  ```
  hugo
  ```

  then
  ```
  npx pagefind --site public/docs --output-path static/pagefind
  ```

- Start your development environment
  ```
  npm run start
  ```

  or

  ```
  yarn dev
  ```

  or 

  ```
  hugo serve
  ```


### Set up your Local Development Environment

1. **Fork the Repository**: Click the "Fork" button in the upper right-hand corner of the [mirrord.dev](https://github.com/metalbear-co/mirrord.dev/) repository on GitHub.

2. **Clone Your Fork**: Clone your fork of the repository to your local machine:

    ```
   git clone https://github.com/your-username/mirrord.dev.git
    ```

3. **Create a Branch**: Create a new branch for your contribution:
    ```
    git checkout -b your-branch-name
    ```
4. **Make Changes**: Make your desired changes to the codebase. Ensure your code follows our coding standards and guidelines.

5. **Test**: Preview your changes to ensure they work as expected.

6. **Commit Changes**: Commit your changes with a clear and descriptive message.
    ```
    git add .
    git commit -s -m "<Brief description of your changes>"
    ```
7. **Push Changes**: Push your changes to your fork on GitHub:
    ```
    git push origin your-branch-name
    ```
8. **Create a Pull Request**: Go to the mirrord.dev repository and create a new pull request from your fork. Describe your changes and why they should be merged.

9. **Review and Discussion**: Your pull request will be reviewed by the maintainers and the community. Be prepared for feedback and be responsive to any suggested changes.

10. **Merge**: Once your pull request is approved, it will be merged into the main project.
