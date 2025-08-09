export class GitHubUserFormatter {
  static format(user) {
    if (!user || !user.providerData || !user.providerData.length) return {}
    const githubProfile = user.providerData.find(
      (p) => p.providerId === 'github.com'
    )
    if (!githubProfile) return {}
    return {
      githubLogin: githubProfile.username || null,
      githubProfileUrl: githubProfile.html_url || null,
      githubAvatarUrl: githubProfile.photoURL || null,
      fullName: githubProfile.displayName || null,
      email: githubProfile.email || null,
    }
  }
}