# Builds dist/vscode-language-pack-be-<version>.vsix without any external tooling.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = Split-Path -Parent $PSScriptRoot
$pkg = Get-Content (Join-Path $root 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$version = $pkg.version
$id = $pkg.name
$engine = $pkg.engines.vscode

$manifest = @"
<?xml version="1.0" encoding="utf-8"?>
<PackageManifest Version="2.0.0" xmlns="http://schemas.microsoft.com/developer/vsx-schema/2011" xmlns:d="http://schemas.microsoft.com/developer/vsx-schema-design/2011">
	<Metadata>
		<Identity Language="en-US" Id="$id" Version="$version" Publisher="$($pkg.publisher)" />
		<DisplayName>$($pkg.displayName)</DisplayName>
		<Description xml:space="preserve">$($pkg.description)</Description>
		<Categories>Language Packs</Categories>
		<Properties>
			<Property Id="Microsoft.VisualStudio.Code.Engine" Value="$engine" />
			<Property Id="Microsoft.VisualStudio.Code.ExtensionDependencies" Value="" />
			<Property Id="Microsoft.VisualStudio.Code.ExtensionPack" Value="" />
			<Property Id="Microsoft.VisualStudio.Code.ExtensionKind" Value="ui,workspace" />
			<Property Id="Microsoft.VisualStudio.Code.LocalizedLanguages" Value="" />
		</Properties>
	</Metadata>
	<Installation>
		<InstallationTarget Id="Microsoft.VisualStudio.Code" />
	</Installation>
	<Dependencies />
	<Assets>
		<Asset Type="Microsoft.VisualStudio.Code.Manifest" Path="extension/package.json" Addressable="true" />
	</Assets>
</PackageManifest>
"@

$contentTypes = @"
<?xml version="1.0" encoding="utf-8"?>
<Types>
	<Default Extension=".json" ContentType="application/json" />
	<Default Extension=".vsixmanifest" ContentType="text/xml" />
</Types>
"@

$dist = Join-Path $root 'dist'
New-Item -ItemType Directory -Force $dist | Out-Null
$out = Join-Path $dist "$id-$version.vsix"
if (Test-Path $out) { Remove-Item $out -Force }

$utf8 = New-Object System.Text.UTF8Encoding($false)
$zip = [System.IO.Compression.ZipFile]::Open($out, 'Create')
try {
	function Add-Text($zip, $name, $text) {
		$e = $zip.CreateEntry($name, 'Optimal')
		$w = New-Object System.IO.StreamWriter($e.Open(), $utf8)
		$w.Write($text); $w.Dispose()
	}
	function Add-File($zip, $name, $path) {
		[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $path, $name, 'Optimal') | Out-Null
	}
	Add-Text $zip '[Content_Types].xml' $contentTypes
	Add-Text $zip 'extension.vsixmanifest' $manifest
	Add-File $zip 'extension/package.json' (Join-Path $root 'package.json')
	Add-File $zip 'extension/translations/main.i18n.json' (Join-Path $root 'translations\main.i18n.json')
} finally { $zip.Dispose() }

Write-Host "Built $out ($([math]::Round((Get-Item $out).Length / 1KB)) KB)"
