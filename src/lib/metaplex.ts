import { Metaplex, keypairIdentity, bundlrStorage } from '@metaplex-foundation/js';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

export class NomadPassportMinter {
  private metaplex: Metaplex;
  private connection: Connection;

  constructor(connection: Connection, payer: Keypair) {
    this.connection = connection;
    this.metaplex = Metaplex.make(connection)
      .use(keypairIdentity(payer))
      .use(bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: 'https://api.devnet.solana.com',
        timeout: 60000,
      }));
  }

  async mintNomadPassport(
    recipientAddress: PublicKey,
    userData: {
      name: string;
      citiesJoined: string[];
      level: number;
      reputation: number;
    }
  ) {
    try {
      // Upload metadata to Arweave
      const { uri } = await this.metaplex.nfts().uploadMetadata({
        name: `Nomad Passport - ${userData.name}`,
        description: `Digital nomad passport for ${userData.name}. Level ${userData.level} with ${userData.citiesJoined.length} cities joined.`,
        image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${userData.name}`,
        attributes: [
          { trait_type: 'Level', value: userData.level },
          { trait_type: 'Cities Joined', value: userData.citiesJoined.length },
          { trait_type: 'Reputation Score', value: userData.reputation },
          { trait_type: 'Cities', value: userData.citiesJoined.join(', ') },
        ],
        properties: {
          category: 'image',
          files: [
            {
              type: 'image/svg+xml',
              uri: `https://api.dicebear.com/7.x/adventurer/svg?seed=${userData.name}`,
            },
          ],
        },
      });

      // Mint the NFT
      const { nft } = await this.metaplex.nfts().create({
        uri,
        name: `Nomad Passport - ${userData.name}`,
        sellerFeeBasisPoints: 0,
        tokenOwner: recipientAddress,
        symbol: 'NOMAD',
        isMutable: true,
      });

      return {
        success: true,
        nftAddress: nft.address.toString(),
        metadataUri: uri,
      };
    } catch (error) {
      console.error('Error minting Nomad Passport:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async mintCityBadge(
    recipientAddress: PublicKey,
    cityData: {
      cityName: string;
      userRole: string;
      joinDate: Date;
      achievements: string[];
    }
  ) {
    try {
      const { uri } = await this.metaplex.nfts().uploadMetadata({
        name: `${cityData.cityName} Citizen Badge`,
        description: `Citizenship badge for ${cityData.cityName}. Role: ${cityData.userRole}. Joined: ${cityData.joinDate.toLocaleDateString()}.`,
        image: `https://api.dicebear.com/7.x/shapes/svg?seed=${cityData.cityName}`,
        attributes: [
          { trait_type: 'City', value: cityData.cityName },
          { trait_type: 'Role', value: cityData.userRole },
          { trait_type: 'Join Date', value: cityData.joinDate.toISOString() },
          { trait_type: 'Achievements', value: cityData.achievements.length },
        ],
        properties: {
          category: 'image',
          files: [
            {
              type: 'image/svg+xml',
              uri: `https://api.dicebear.com/7.x/shapes/svg?seed=${cityData.cityName}`,
            },
          ],
        },
      });

      const { nft } = await this.metaplex.nfts().create({
        uri,
        name: `${cityData.cityName} Citizen Badge`,
        sellerFeeBasisPoints: 0,
        tokenOwner: recipientAddress,
        symbol: 'BADGE',
        isMutable: false,
      });

      return {
        success: true,
        nftAddress: nft.address.toString(),
        metadataUri: uri,
      };
    } catch (error) {
      console.error('Error minting city badge:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}